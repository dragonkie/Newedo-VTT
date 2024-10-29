import sysUtil from "../../helpers/sysUtil.mjs";
import LOGGER from "../../helpers/logger.mjs";
import { ItemDataModel } from "../abstract.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class WeaponData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.price = this.AddPriceField(75, 50, 100, 3);
        schema.quality = this.AddResourceField(1, 10, 1);
        schema.skill = new SchemaField({
            slug: new StringField({ initial: 'lightmelee' }),
            id: new StringField({ initial: '' })
        });
        schema.equipped = new BooleanField({ initial: false });

        // Weapon EXP tracker, populated with a max value during data prep
        schema.grit = new SchemaField({
            value: new NumberField({ initial: 0 }),
            min: new NumberField({ initial: 0 }),
            atk: new NumberField({ initial: 0 }),// Grit tier attack bonus, combined the bonuses cant exceed grit.value / 2 rouding down
            dmg: new NumberField({ initial: 0 })// Grit tier damage bonus
        });

        let setOptions = {
            required: true,
            nullable: false,
            label: "Field Label",
            hint: "Field Hint",
            initial: [{}]
        }

        schema.damage = new SchemaField({
            value: new StringField({ initial: "1d6" }),
            type: new StringField({ initial: "kin" }),
            parts: new SetField(new SchemaField({
                formula: new StringField({ initial: "1d8" }),
                type: new StringField({ initial: "kin" }),
            }), setOptions)
        });

        schema.ranged = new BooleanField({ initial: false });

        // Weapon ranges are either the melee/thrown ranges or short/long weapon ranges, only ranged weapons use the modifiers
        schema.range = new SchemaField({
            short: new NumberField({ initial: 10 }),
            long: new NumberField({ initial: 10 }),
            modShort: new NumberField({ initial: 3 }),
            modLong: new NumberField({ initial: 3 })
        })

        // Weapon magazine tracker, weapons with max of 1 should auto consume from their linked ammo item on attack rather than storing values here
        schema.ammo = new SchemaField({
            min: new NumberField({ initial: 0 }),
            max: new NumberField({ initial: 6 }),
            min: new NumberField({ initial: 0 }),
        })

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        // Corrects quality values
        if (this.quality.value > this.quality.max) this.quality.value = this.quality.max;
        if (this.quality.value < 1) this.quality.value = 1;

        // Corrects grit values
        this.grit.max = this.quality.value * 2;
        if (this.grit.value > this.quality.value * 2) this.grit.value = this.quality.value * 2;// Maximum grit is the quality of the weapon * 2
        if (this.grit.value < 0) this.grit.value = 0;// Minimum of 0 grit

        // If the grit modifiers are higher than what the grit allows, lowers them evenly until they are acceptable
        while (this.grit.atk + this.grit.dmg > this.grit.value / 2) {
            if (this.grit.atk > this.grit.dmg) this.grit.atk -= 1;
            else this.grit.dmg -= 1;
        }

        // Prep data relevant to skill
        if (this.actor) {
            this.skill.slug = this.actor.items.get(this.skill.id).system.slug;
        } else {
            this.skill.id = '';
        }

        // Add a localizeable label to the skill slug to make life easier
        this.skill.label = `NEWEDO.skill.${this.skill.slug}`;
    }

    getRollData() {
        let data = super.getRollData();
        if (!data) return null;

        data.skill = this.getSkill();
        if (!data.skill) return null;
        data.trait = data.skill.system.getTrait();

        data.formula = {
            skill: data.skill.system.getFormula({ mode: 'normal', trait: false }),
            full: data.skill.system.getFormula()
        };

        data.grit = this.grit;
        data.system = this;

        return data;
    }

    getSkill() {
        if (this.actor) {
            for (const item of this.actor.itemTypes.skill) {
                if (item.id == this.skill.id) return item
                if (item.system.slug == this.skill.slug) {
                    this.parent.update({ 'system.skill.id': item.id });
                    return item;
                }
            }
            sysUtil.error('NEWEDO.error.MissingSkill');
        }
        sysUtil.error('NEWEDO.error.MissingActor');
        return null;
    }

    async use(action) {
        if (action === 'equip') this._onEquip();
        if (action === 'attack') this._onUseAttack();
        if (action === 'damage') this._onUseDamage();
    }

    async _onEquip() {
        await this.parent.update({ 'system.equipped': !this.equipped });
    }

    async _onUseAttack() {
        // if there isnt an owning actor
        const actor = this.actor;
        if (!actor) return;

        // Gather relevant data
        const rollData = this.getRollData();

        // Create and parse roll options dialog
        let options = await sysUtil.getRollOptions(rollData, this.constructor.TEMPLATES.attack());
        if (options.cancled) return;

        LOGGER.debug("Roll data:", rollData);
        LOGGER.debug("Roll options:", options);

        let formula = rollData.skill.system.getFormula(options);;// final string parsed formula
        let mods = 0;// total flat bonuses and penalties

        if (options.skill != '') formula += '+' + options.skill
        if (options.useWound) mods += rollData.wound.value;
        if (options.legend > 0) {
            if (sysUtil.spendLegend(actor, options.legend)) {
                mods += options.legend;
            }
        }

        if (mods > 0) formula += '+' + mods;
        if (mods < 0) formula += mods;

        if (options.bonus != '') {
            let v = Roll.validate(options.bonus);
            if (v) formula += '+' + options.bonus
        }

        let r = new Roll(formula);
        await r.evaluate();

        // Gets the list of targets and if they were hit or not, if they were in range, etc
        let userTargets = game.user.targets;
        let targets = [];

        let scene = game.scenes.get(game.user.viewedScene);
        let scale = scene.grid.size;
        let attacker = this.actor.token;

        if (!attacker) attacker = scene.tokens.getName(this.actor.name);

        for (const a of game.user.targets.entries()) {
            let data = {
                hit: false,
                name: a[0].actor.name,
                uuid: a[0].actor.uuid,
                def: a[0].actor.system.traits.derived.def.total,
                size: a[0].actor.system.size.value,
                dist: Math.sqrt(Math.pow(attacker.x - a[0].x, 2) + Math.pow(attacker.y - a[0].y, 2)) / scene.grid.size,
                tn: 0
            }

            if (this.ranged) {
                // ranged attacks are made against enemy size * range mult
                data.tn = a[0].actor.system.size.value * this.range.modShort;
                if (data.dist > this.range.short) data.tn = a[0].actor.system.size.value * this.range.modLong;

                if (r.total >= data.tn) data.hit = true;
            } else {
                // Melee attack made against target defence
                if (r.total >= data.def) data.hit = true;
                data.tn = data.def;
            }

            if (attacker) {
                if (data.dist > this.range.short && data.dist > this.range.long) data.oor = true;
            }

            targets.push(data);
        }

        const messageData = {
            content: `<div>Attack with ${this.parent.name}</div>`
        };

        for (const t of targets) {
            messageData.content += `
            <div>
                ${t.name}: 
                <b style="color: ${t.hit ? "green" : "red"};">${t.hit ? "HIT" : "MISS"}</b> 
                TN ${t.tn} ${t.oor ? "(Out of range)" : ""}
            </div>
            `;
        }

        messageData.content += await r.render();

        messageData.content += `<input data-uuid="${this.parent.uuid}" class="damage-button" type="button" value="Damage" />`;

        let msg = await r.toMessage(messageData);

        console.log(msg);
        return r;
    }

    async _onUseDamage() {
        const rollData = this.getRollData();

        let formula = '';
        if (!rollData) return;
        if (this.ranged) {
            formula = this.damage.value + '[' + this.damage.type + ']';
        } else {
            formula = `(${rollData.pow.rank}d10x10+${this.damage.value})[${this.damage.type}]`;
        }

        // Clean the formula that was put in of exploding dice to ensure no doubles
        formula = formula.replaceAll('d10x10', 'd10');
        // Add exploding d10s back in to catch any missed by players
        formula = formula.replaceAll('d10', 'd10x10');

        if (this.grit.dmg > 0) {
            formula += `+ ${this.grit.dmg}`;
        }

        let r = new Roll(formula, rollData);
        await r.evaluate();
        console.log(this.parent.name)
        r.toMessage({
            flavor: `
            <div>${this.parent.name}</div>
            <div>${sysUtil.localize('NEWEDO.damage.' + this.damage.type)} damage</div>
            `,
            speaker: { actor: this.parent.id }
        });
    }

    get atkFormula() {
        const skill = this.skill;// Gets the skill item
        if (!skill) return null;

        let formula = skill.formula;
        if (this.grit.atk > 0) formula = sysUtil.formulaAdd(formula, this.grit.atk);
        if (this.attack.bonus != 0) formula = sysUtil.formulaAdd(formula, this.attack.bonus);
        return formula;
    }

    get dmgFormula() {
        const skill = this.skill;// Gets the skill item
        if (!skill) return null;

        const trait = skill.trait;
        let formula = ``;
        if (!this.ranged) formula += `${trait.rank}d10`;
        formula = sysUtil.formulaAdd(formula, this.damage.value);
        if (this.grit.dmg > 0) formula = sysUtil.formulaAdd(formula, this.grit.dmg);
        return formula;
    }

    static TEMPLATES = {
        attack: () => `systems/${game.system.id}/templates/dialog/weapon-attack.hbs`,
        damage: () => `systems/${game.system.id}/templates/dialog/weapon-damage.hbs`
    }

    get isRanged() {
        return this.ranged == true;
    }

    get isEquipped() {
        return this.equipped == true;
    }
}