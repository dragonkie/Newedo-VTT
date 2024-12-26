import NewedoRoll from "../../helpers/dice.mjs";
import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { ItemDataModel } from "../abstract.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class RoteData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.rank = new NumberField({ initial: 1 });
        schema.range = new NumberField({ initial: 1 });
        schema.cost = new NumberField({ initial: 1 });
        schema.duration = new NumberField({ initial: 1, required: true, nullable: false });
        schema.skill = new SchemaField({
            slug: new StringField({ initial: 'arcana' }),
            id: new StringField({ initial: '' })
        });
        schema.tn = new NumberField({ initial: 1 });
        schema.action = new StringField({ initial: 1 });

        schema.rules = new SchemaField({
            rollRange: new SchemaField({
                active: new BooleanField({ initial: false }),
            }),
            rollDuration: new SchemaField({
                active: new BooleanField({ initial: false }),
            }),
            rollPotency: new SchemaField({
                active: new BooleanField({ initial: false }),
            })
        })

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        if (this.actor) {

        }
    }

    getRollData() {
        LOGGER.debug('RoteData | getRollData');
        const data = super.getRollData();
        if (!data) return null;

        data.trait = this.actor.system.traits.core.shi.rank;

        return data;
    }

    getSkill() {
        if (this.skill.id && this.actor) {
            return this.actor.items.get(this.skill.id);
        }

        return null;
    }

    async use(action) {
        switch (action) {
            default: break;
        }

        return this._onCast();
    }

    async _onCast() {
        const actor = this.actor;
        if (!actor) return;

        const rollData = this.getRollData();
        const skill = this.getSkill();
        console.log('CASTING SPELL DATA: ', rollData);

        let data = {
            parts: [{
                type: "NEWEDO.generic.trait",
                label: "NEWEDO.trait.core.shi",
                value: `${actor.system.traits.core.shi.rank}d10`
            }, {
                type: "NEWEDO.generic.skill",
                label: skill.name,
                value: skill.system.getRanks()
            }],
            bonuses: [],
            wound: rollData.wound,
            title: this.parent.name
        }

        let roll = await new NewedoRoll(data);
        let options = await roll.getRollOptions();
        let _r = await roll.evaluate();
        _r.toMessage();

    }

    static TEMPLATES = {
        rollCasting: `systems/newedo/templates/dialog/rote-roll.hbs`
    }
}