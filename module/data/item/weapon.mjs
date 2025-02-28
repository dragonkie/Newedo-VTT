
import LOGGER from "../../helpers/logger.mjs";
import { ItemDataModel } from "../abstract.mjs";
import { ResourceField, PriceField, GritField } from "../fields.mjs";

import NewedoRoll from "../../helpers/dice.mjs";

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
        schema.equipped = new BooleanField({ initial: false, required: true });

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
        super.prepareBaseData();
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
        if (this.actor && this.skill.id != '') {
            this.skill.slug = this.actor.items.get(this.skill.id)?.system.slug;
            this.skill.label = this.getSkill()?.name;
        }
    }

    getRollData() {
        
        const data = super.getRollData();
        if (!data) return null;

        data.skill = this.getSkill();
        if (data.skill) data.trait = data.skill.system.getTrait();
        data.grit = this.grit;

        LOGGER.debug('WeaponData | getRollData', data);
        return data;
    }

    getSkill() {
        if (this.actor) {
            if (this.skill.id != '') {
                // Gets the linked item
                return this.actor.items.get(this.skill.id);
            } else {
                // If there isn't a linked item, we grab the first weapon skill available and use it until otherwise assigned
                for (const item of this.actor.itemTypes.skill) {
                    if (item.system.isWeaponSkill) {
                        this.skill.id = item.id;
                        return item;
                    }
                }
            }
            return null;
        }
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
        LOGGER.debug('Weapon isEquipped changed to: ', !this.isEquipped);
        await this.parent.update({ 'system.equipped': !this.equipped });
    }

    async _onAttack() {
        // if there isnt an owning actor
        const actor = this.actor;
        if (!actor) return;

        // Gather relevant data
        const rollData = this.getRollData();
        const skill = rollData.skill;
        LOGGER.debug('attack data', rollData)

        const roll = new NewedoRoll({
            title: 'NEWEDO.generic.attack',
            actor: this.actor,
            raise: true,
            data: rollData
        });

        roll.AddPart([{
            type: "NEWEDO.generic.trait",
            label: `${rollData.trait.label}`,
            value: `${rollData.trait.rank}d10`
        }, {
            type: "NEWEDO.generic.skill",
            label: skill.name,
            value: skill.system.getRanks()
        }, {
            type: "NEWEDO.generic.grit",
            label: 'NEWEDO.generic.attack',
            value: this.grit.atk
        }])

        await roll.evaluate();

        LOGGER.debug('Roll options: ', roll);
        if (roll.cancelled) return;

        // Gets the list of targets and if they were hit or not, if they were in range, etc
        const userTargets = game.user.targets;
        const scene = game.scenes.get(game.user.viewedScene);
        let targets = [];

        let attacker = this.actor.token;
        if (!attacker) {
            for (let t of scene.tokens.contents) {
                if (t.actorId == this.actor.id) {
                    attacker = t;
                    break;
                }
            }
        }

        if (attacker && game.user.targets.size > 0) {
            for (const a of userTargets.entries()) {
                // prep a data object releveant to how we hit the target
                let data = {
                    hit: false,
                    name: a[0].actor.name,
                    uuid: a[0].actor.uuid,
                    def: a[0].actor.system.traits.derived.def.total,
                    size: a[0].actor.system.size.value,
                    dist: Math.sqrt(Math.pow(attacker.x - a[0].x, 2) + Math.pow(attacker.y - a[0].y, 2)) / scene.grid.size,
                    range: "short",
                    tn: 0,
                    raise: roll.options.raise * 5
                }

                // Checks if the attack hits
                if (this.ranged) {
                    data.tn = a[0].actor.system.size.value * this.range.modShort;
                    if (data.dist > this.range.short) data.tn = a[0].actor.system.size.value * this.range.modLong;
                } else data.tn = data.def;

                if (roll.total >= data.tn + data.raise) data.hit = true;

                // relevant targeting data like if the weapon is out of range, or in the long shot / thrown range
                if (data.dist > this.range.short) data.range = "long";
                else if (data.dist > this.range.long) data.range = "oor";

                targets.push(data);
            }
        }

        const messageData = {
            content: `<div>@UUID[${this.actor.uuid}] attacks with @UUID[${this.parent.uuid}]</div><br>`
        };

        if (roll.options.raise > 0) {
            messageData.content += `<div>Raised <b>${roll.options.raise}</b> times, TN raised by <b>${roll.options.raise * 5}</b></div><br>`;
        }

        for (const t of targets) {
            messageData.content += `
            <div style="margin-bottom: 5px;">
                @UUID[${t.uuid}]: 
                <b style="color: ${t.hit ? "green" : "red"};">${t.hit ? "HIT" : "MISS"}</b> 
                TN ${t.tn + roll.options.raise * 5} ${t.range == "oor" ? "(Out of range)" : (t.range == "long" ? (this.ranged ? "(Long Range)" : "(Thrown)") : "")}
            </div>
            `;
        }

        messageData.content += await roll.render();

        messageData.content += `<input data-uuid="${this.parent.uuid}" class="damage-button" type="button" value="Damage">`;

        LOGGER.debug('Message Data: ', messageData);
        let msg = await roll.toMessage(messageData);

        msg.setFlag('newedo', 'attackData', {
            targets: targets,
            raises: roll.options.raise,
        })

        return roll;
    }

    // newer version of the attack roll
    async _onDamage(attack = {}) {
        // if there isnt an owning actor
        const actor = this.actor;
        if (!actor) return;

        // Gather relevant data
        const rollData = this.getRollData();

        let roll = new NewedoRoll({
            legend: false,
            title: 'NEWEDO.generic.damage',
            actor: this.actor,
            data: rollData
        });

        roll.AddPart([{
            type: "NEWEDO.generic.trait",
            label: `${rollData.trait.label}`,
            value: `${rollData.trait.rank}d10`
        }, {
            type: "TYPES.Item.weapon",
            label: `${this.parent.name}`,
            value: `${this.damage.value}`
        }, {
            type: "NEWEDO.generic.grit",
            label: `NEWEDO.generic.damage`,
            value: this.grit.dmg
        }])

        // adds raise dice if a raise was called
        if (attack?.raises > 0) {
            roll.AddPart({
                type: "NEWEDO.generic.raise",
                label: "NEWEDO.generic.damage",
                value: `${attack.raises}d10`
            })
        } else {
            roll.raise = true;
        }

        await roll.evaluate();
        if (roll.cancelled) return;

        // COVNERT ROLL INTO CHAT CARD
        const messageData = {
            content: `
                <div>${this.parent.name}</div>
                <div>${newedo.utils.localize('NEWEDO.damage.' + this.damage.type)} damage</div>`,
        };

        // If we have data passed into the argument, that means this was called with targeting data
        if (attack.targets && Array.isArray(attack.targets) && attack.targets.length > 0) {
            const targets = [];
            messageData.content += `<div class="damage-data" data-attacker="${this.actor?.uuid}" data-damage-total="${roll.total}" data-damage-type="${this.damage.type}">`;

            for (const t of attack.targets) {
                targets.push(await fromUuid(t.uuid));

                messageData.content += `
                <div style="margin: 5px 0;">
                    @UUID[${t.uuid}]{${t.name}}
                    <a class="apply-damage" title="apply damage" data-target="${t.uuid}">
                        <b style="color: ${t.hit ? "green" : "red"};">${t.hit ? "HIT" : "MISS"}</b>
                        <i class="fa-solid fa-bolt"></i>
                    </a>
                </div>`;
            }

            messageData.content += `
            <div>
                <input class="apply-damage-all" type="button" value="${newedo.utils.localize('NEWEDO.chat.applyAllDamage')}">
                <input class="undo-damage-all" type="button" value="${newedo.utils.localize('NEWEDO.chat.undoAllDamage')}">
            </div>
            `;

            messageData.content += `</div>`;
        }
        messageData.content += await roll.render();

        return await roll.toMessage(messageData);
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