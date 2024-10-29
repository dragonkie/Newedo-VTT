import { ItemDataModel } from "../abstract.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import LOGGER from "../../helpers/logger.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class SkillData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.trait = new StringField({ initial: 'hrt', required: true });
        schema.isWeaponSkill = new BooleanField({ initial: false, required: true, });
        schema.useTraitRank = new BooleanField({ initial: true, required: true });
        schema.slug = new StringField({ initial: '' });
        schema.ranks = new ArrayField(
            new NumberField({
                initial: 0,
                required: true,
                nullable: false
            }),
            {
                initial: [0, 0, 0, 0, 0],
                required: true,
                nullable: false
            }
        );

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        if (this.slug === '') this.slug = this.parent.name.toLowerCase().replaceAll(' ', '');
    }

    async use() {
        this.roll();
    }

    getRollData() {
        if (!this.actor) return null;
        const data = super.getRollData();

        data.trait = data[this.trait];

        return data;
    }

    getTrait() {
        if (this.actor) return this.actor.system.traits.core[this.trait];
        return null;
    }

    /**
     * Returns this skills rollable formula, with or without the trait, and including advantage / disadvantage
     * @param {*} mode 
     * @param {*} trait 
     */
    getFormula(options = { advantage: false, disadvantage: false, useTrait: true }) {
        const rollData = this.getRollData();
        if (!rollData) return;// if we cant get roll data, method cant be used

        const dice = this.dice(options);

        let formula = '';
        let first = true;
        for (const d of dice) {
            if (!first) formula += '+';
            formula += d.count + 'd' + d.faces;
            for (const m of d.modifiers) formula += m;
            first = false;
        }

        return formula;
    }

    /**
     * Creates list of dice objects to use with rolls
     * @param {*} trait defaults to true, which includes the skills relevant trait dice when referenced
     * @returns {Array}
     */
    dice(options = { advantage: false, disadvantage: false, useTrait: true }) {
        const rollData = this.getRollData();
        const list = [];

        // advantage and disadvantage cancel eachother out, shouldnt be able to roll this easily but this is to catch
        // those slim edge case scewnarios
        if (options.advantage && options.disadvantage) {
            LOGGER.debug('Advantage and disadvantage at the same time');
            options.advantage = options.disadvantage = true;
        }

        // grabs dice ranks and pools them
        for (const r of this.ranks) {
            if (r <= 0) continue;//skips over dice ranks that dont have real dice
            let found = false;
            for (let i = 0; i < list.length; i++) {
                //if a matching dice was found, add it to their pool
                if (list[i].faces === r) {
                    list[i].count += 1;
                    found = true;
                    break;
                }
            }
            //if the dice doesnt exist yet, add it to the list
            if (!found) list.push({ faces: r, count: 1, modifiers: [] });
        }

        // organize the dice to be nice to look at
        list.sort((a, b) => {
            if (a.faces > b.faces) return 1;
            if (a.faces < b.faces) return -1;
            return 0;
        })

        // adds the trait dice if enabled, stored at begining of array
        let d = { faces: 10, count: 0, modifiers: ['x10'] }
        if (rollData && options.useTrait) {
            d.count += rollData.trait.rank
        }
        // adds advantage bonus d10
        if (options.advantage) d.count += 1;
        // removes a d10 for disadvantage, or next highest if there are no d10s
        if (options.disadvantage) {
            if (d.count > 0) d.count -= 1;
            else list[list.length - 1].count -= 1;

        }

        if (d.count > 0) list.unshift(d);
        return list;
    }

    /**
     * Updates a skill rank but moving the dice up or down a tier
     * @param {Event} event 
     * @returns 
     */
    async _cycleSkillDice(index, invert = false) {
        const ranks = this.ranks;

        if (!invert) {
            ranks[index] += 2;
            if (ranks[index] === 2 || ranks[index] === 10) ranks[index] += 2;
            else if (ranks[index] > 12) ranks[index] = 0;
        } else if (invert) {
            ranks[index] -= 2;
            if (ranks[index] === 2 || ranks[index] === 10) ranks[index] -= 2;
            else if (ranks[index] < 0) ranks[index] = 12;
        }

        return await this.parent.update({ system: { ranks: ranks } });
    }

    // Creates and rolls a NewedoRoll using this item, giving it the context that this is a skill roll
    async roll() {
        if (!this.actor) {
            sysUtil.warn(`NEWEDO.notify.warn.noActor`);
            return null;
        }

        // Creates the popup dialog asking for your roll data
        const options = await sysUtil.getRollOptions(this.getRollData(), this.constructor.TEMPLATES.roll());
        if (options.canceled) return null;// Stops the roll if they decided they didnt want to have fun

        let formula = this.getFormula(options);// final string parsed formula
        let flavorText = `<p style="font-size: 14px; margin: 4px 0 4px 0;">${this.parent.name}</p>`;
        let mods = 0;// total flat bonuses and penalties

        switch (options.advantage) {
            case 'advantage':
                flavorText += '<p style="font-size: 14px; margin: 4px 0 4px 0;">Advantage</p>';
                break;
            case 'disadvantage':
                flavorText += '<p style="font-size: 14px; margin: 4px 0 4px 0;">Disadvantage</p>';
                break;
        }

        if (options.useWound) mods += options.wound;
        if (options.legend > 0) {
            if (sysUtil.spendLegend(this.actor, options.legend)) {
                mods += options.legend;
                flavorText += `<p style="font-size: 14px; margin: 4px 0 4px 0;">Spent ${options.legend} legend</p>`;
            }
        }

        if (mods > 0) formula += '+' + mods;
        if (mods < 0) formula += mods;

        LOGGER.log('options', options);

        let r = new Roll(formula);
        await r.evaluate();
        await r.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: flavorText
        });
        return r;
    }

    static TEMPLATES = {
        roll: () => `systems/${game.system.id}/templates/dialog/skill-roll.hbs`
    }
}