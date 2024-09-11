import NewedoItem from "../item.mjs";
import { Dice, NewedoRoll } from "../../../helpers/dice.mjs";
import sysUtil from "../../../helpers/sysUtil.mjs";
import LOGGER from "../../../helpers/logger.mjs";

export default class NewedoSkill extends NewedoItem {
    constructor(data, options) {
        super(data, options);
    }

    prepareBaseData() {
        this.system.rollTrait = true;
    }

    prepareDerivedData() {
        this.system.formula = this.formula
    }

    getRollData() {
        const data = super.getRollData();
        data.trait = this.trait;
        data.formula = {
            full: this.getFormula(),
            ranks: this.getFormula(false)
        }
        return foundry.utils.deepClone(data);
    }

    /* ----------------------------------------------- Item Actions ------------------------------------------------- */
    /**
     * @override
     */
    async _onUse() {
        return this.roll();
    }

    /**
     * @returns {Object} Gets safe copy of owning actors trait, or undefined
     */
    get trait() {
        return this.actor?.getTrait(this.system.trait);
    }

    // shorthand for calling full dice formula, usable in handelbars
    get formula() {
        if (!this.actor) return null;
        return this.getFormula(true);
    }

    get ranksFormula() {
        if (!this.actor) return null;
        return this.getFormula(false);
    }

    /** Returns a formula string just using the skill ranks */
    getFormula(trait = true) {
        let formula = '';
        let dice = this.dice(trait);

        for (const d of dice) {
            let f = `${d.count}d${d.faces}`;
            if (formula != '') formula += '+';
            formula += f;
        }

        return formula;
    }

    /**
     * Creates list of dice objects to use with rolls
     * @param {*} trait defaults to true, which includes the skills relevant trait dice when referenced
     * @returns {Array}
     */
    dice(trait = true) {
        const list = [];

        // grabs dice ranks and pools them
        for (const r of this.system.ranks) {
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
            if (!found) list.push({ faces: r, count: 1 });
        }

        // organize the dice to be nice to look at
        list.sort((a, b) => {
            if (a.faces > b.faces) return 1;
            if (a.faces < b.faces) return -1;
            return 0;
        })

        // adds the trait dice if enabled
        if (trait) {
            if (!this.actor) return;
            list.unshift({ faces: 10, count: this.trait.rank });
        }
        return list;
    }

    /**
     * Updates a skill rank but moving the dice up or down a tier
     * @param {Event} event 
     * @returns 
     */
    async _cycleSkillDice(event) {
        const index = event.target.dataset.index;
        const ranks = this.system.ranks;
        LOGGER.debug(`Event`, event);

        if (event.type === `click`) {
            ranks[index] += 2;
            if (ranks[index] === 2 || ranks[index] === 10) ranks[index] += 2;
            if (ranks[index] > 12) ranks[index] = 0;
        } else if (event.type === `contextmenu`) {
            ranks[index] -= 2;
            if (ranks[index] === 2 || ranks[index] === 10) ranks[index] -= 2;
            if (ranks[index] < 0) ranks[index] = 12;
        }

        return await this.update({ [`system.ranks`]: ranks });
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

        let formula = '';// final string parsed formula
        let mods = 0;// total flat bonuses and penalties

        if (options.useTrait) {
            let dice = this.trait.rank;
            if (options.advantage == 'advantage') dice += 1;
            if (options.advantage == 'disadvantage') dice -= 1;
            if (dice > 0) formula += dice + 'd10x10';
        }

        console.log(options)

        if (options.skill != '') formula += '+' + options.skill
        if (options.useWound) mods += options.wound;
        if (options.legend > 0) {
            if (sysUtil.spendLegend(actor, options.legend)) {
                mods += options.legend;
            }
        }

        if (mods > 0) formula += '+'+mods;
        if (mods < 0) formula += mods;

        let r = new Roll(formula);
        await r.evaluate();
        await r.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<p style="font-size: 14px; margin: 4px 0 4px 0;">${this.name}</p>`
        });
        return r;
    }

    static TEMPLATES = {
        roll : () => `systems/${game.system.id}/templates/dialog/skill-roll.hbs`
    }
}

