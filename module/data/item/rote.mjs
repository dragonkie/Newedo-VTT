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
        schema.duration = new NumberField({ initial: 1 });
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

        let options = await sysUtil.getRollOptions(rollData, this.constructor.TEMPLATES.rollCasting);
        if (options.cancled) return;

        let formula = this.getFormula(options);
        let flavorText = `<p style="font-size: 14px; margin: 4px 0 4px 0;">${this.parent.name}</p>`;
        let mods = 0;

        if (options.useWound) mods += options.wound;
        if (options.legend > 0) {
            if (sysUtil.spendLegend(this.actor, options.legend + this.cost)) {
                mods += options.legend;
                flavorText += `<p style="font-size: 14px; margin: 4px 0 4px 0;">Spent ${options.legend + this.cost} legend</p>`;
            }
        }

        if (mods > 0) formula += '+' + mods;
        if (mods < 0) formula += mods;

        let r = new Roll(formula);
        await r.evaluate();
        await r.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: flavorText
        });
        return r;
    }

    static TEMPLATES = {
        rollCasting: `systems/newedo/templates/dialog/rote-roll.hbs`
    }
}