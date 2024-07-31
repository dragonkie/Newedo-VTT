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

    /** Returns a formula string just using the skill ranks */
    getFormula(trait = true) {
        var formula = '';
        var dice = this.dice(trait);

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
        // adds the trait dice if enabled
        if (trait) {
            if (!this.actor) return;
            list.push({ faces: 10, count: this.trait.rank });
        }

        // grabs dice ranks and pools them
        for (const r of this.system.ranks) {
            if (r <= 0) continue;//skips over dice ranks that dont have real dice
            var found = false;
            for (var i = 0; i < list.length; i++) {
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

        var bonus = 0;
        var addon = '';

        /* --- Proccess the roll data --- */
        // Apply wounds
        if (options.wounded && this.actor.woundPenalty < 0) bonus += this.actor.woundPenalty;

        // Spend legend
        if (options.legend > 0) {
            if (!sysUtil.spendLegend(this.actor, options.legend)) return null;
            bonus += options.legend;
        }

        // Add situational bonuses
        if (options.bonus != ``) addon = `+${options.bonus}`;

        let roll = new Roll(this.formula + `+${bonus}` + addon);

        // Rolls the dice
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<p style="font-size: 14px; margin: 4px 0 4px 0;">${this.name}</p>`
        });
    }

    static TEMPLATES = {
        roll : () => `systems/${game.system.id}/templates/dialog/skill-roll.hbs`
    }
}

