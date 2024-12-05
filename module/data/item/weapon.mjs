import sysUtil from "../../helpers/sysUtil.mjs";
import LOGGER from "../../helpers/logger.mjs";
import { ItemDataModel } from "../abstract.mjs";
import GritField from "../../fields/grit-field.mjs";
import PriceField from "../../fields/price-field.mjs";
import ResourceField from "../../fields/resource-field.mjs";

import { NewedoRoll } from "../../helpers/dice.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class WeaponData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.price = new PriceField();
        schema.quality = new ResourceField(1, 1, 5, {});
        schema.skill = new SchemaField({
            slug: new StringField({ initial: '', nullable: false, required: true }),
            id: new StringField({ initial: '', nullable: false, required: true })
        });
        schema.equipped = new BooleanField({ initial: false });

        schema.grit = new GritField();

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
        schema.ammo = new ResourceField(6, 0, 6);

        return schema;
    }

    prepareBaseData() {
        LOGGER.group('WeaponData | prepareBaseData');
        super.prepareBaseData();
        LOGGER.groupEnd();
    }

    prepareDerivedData() {
        LOGGER.group('WeaponData | prepareDerivedData')
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
        if (this.actor && this.skill.id != '') {
            this.skill.slug = this.actor.items.get(this.skill.id).system.slug;
            this.skill.label = this.getSkill().name;
        }
        
        LOGGER.groupEnd();
    }

    getRollData() {
        LOGGER.debug('WeaponData | getRollData');
        const data = super.getRollData();

        data.skill = this.getSkill();
        data.trait = data.skill.system.getTrait();
        data.grit = this.grit;

        return data;
    }

    getSkill() {
        if (this.actor) {
            if (this.skill.id != '') {
                // Gets the linked item
                return this.actor.items.get(this.skill.id);
            } else {
                // If there isn't a linked item, we grab the first weapon skill available
                for (const item of this.actor.itemTypes.skill) {
                    if (item.system.isWeaponSkill) {
                        this.skill.id = item.id;
                        return item;
                    }
                }
            }
            sysUtil.error('NEWEDO.error.MissingSkill');
            return null;
        }
        sysUtil.error('NEWEDO.error.MissingActor');
        return null;
    }

    async use(action) {
        switch (action) {
            case 'equip': return this._onEquip();
            case 'attack': return this._onAttack();
            case 'damage': return this._onDamage();
            default:
                LOGGER.error('Unknown weapon action: ', action);
                return null;
        }
    }

    async _onEquip() {
        await this.parent.update({ 'system.equipped': !this.equipped });
    }

    async _onAttack() {
        // if there isnt an owning actor
        const actor = this.actor;
        if (!actor) return;

        // Gather relevant data
        const rollData = this.getRollData();
        let data = {
            parts: [{
                type: "NEWEDO.generic.trait",
                label: `NEWEDO.trait.core.${this.skill.trait}`,
                value: `${this.skill.trait.rank}d10`
            }, {
                type: "NEWEDO.generic.skill",
                label: this.skill.name,
                value: this.skill.getRanks()
            }],
            bonuses: [{
                label: 'NEWEDO.generic.grit',
                value: this.grit.atk
            }],
            wound: rollData.wound,
            title: 'NEWEDO.generic.attack'
        }

        let roll = new NewedoRoll(data);
        roll.getRollOptions();

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

        return r;
    }

    async _onDamage() {
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
        rollAttack: `systems/newedo/templates/dialog/weapon-attack.hbs`,
        rollDamage: `systems/newedo/templates/dialog/weapon-damage.hbs`
    }

    get isRanged() {
        return this.ranged == true;
    }

    get isEquipped() {
        return this.equipped == true;
    }
}