import NewedoItem from "../edo-item.mjs";
import NewedoDialog from "../../dialog/edo-dialog.js";
import { Dice, NewedoRoll } from "../../utility/dice.js";
import sysUtil from "../../utility/sysUtil.mjs";
import LOGGER from "../../utility/logger.mjs";

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
        data.formula = this.diceFormula;
        return data;
    }
    /**
     * Grabs the full dice formula including an owning actors related trait if the default roll setting includes it
     */
    get formula() {
        var formula = ``;
        if (!this.actor) return null;

        // Grabs the trait dice if applicable
        if (this.system.rollTrait) {
            const trait = this.trait;
            if (trait.rank > 0) formula = `${trait.rank}d10`;
        }

        // Get the formula for the skill dice
        const skillDice = this.diceFormula;
        if (skillDice !== '') formula += `+${skillDice}`;

        // Return the fully compiled formula, for just the skill dice, call use: get diceFormula();
        return formula;
    }

    /** Returns a formula string just using the skill ranks */
    get diceFormula() {
        var formula = '';
        var dice = this.dice;

        var first = true;
        for (const d of dice) {
            const f = d.formula;
            if (f === ``) continue;
            if (!first) formula += '+';
            first = false;
            formula += f;
        }

        return formula;
    }

    /** Returns the trait if there is a parent actor */
    get trait() {
        const actor = this.actor
        const key = this.system.trait;
        if (actor) return actor.system.traits.core[key];
        sysUtil.warn(`NEWEDO.notification.warn.skill.noActor`);
        return undefined;
    }

    /** Returns an array of Dice objects for the skill, does not include the trait dice */
    get dice() {
        const list = [];
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
            if (!found) list.push(new Dice(r));
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
        // Handelbars template to use for getting rolldata
        const template = `systems/newedo/templates/dialog/roll/dialog-roll-skill.hbs`;
        if (!this.actor) {
            sysUtil.warn(`NEWEDO.notify.warn.noActor`);
            return null;
        }

        // Creates the popup dialog asking for your roll data
        const options = await sysUtil.getRollOptions(template, this.getRollData());
        if (options.cancled) return null;// Stops the roll if they decided they didnt want to have fun

        // Create a new roll instance
        const roll = new NewedoRoll;

        /* --- Proccess the roll data --- */
        // Apply wounds
        if (options.wounded && this.actor.woundPenalty < 0) roll.bonuses.push(this.actor.woundPenalty);
        
        // Spend legend
        if (options.legend > 0) {
            if (sysUtil.spendLegend(this.actor, options.legend) === null) {
                sysUtil.warn("NEWEDO.notify.notEnoughLegend");
                return null;
            }
            roll.bonuses.push(options.legend);
        }

        // Add skill dice
        roll.dice = roll.dice.concat(this.dice);

        // Add trait dice
        if (options.useTrait) roll.dice.unshift(new Dice(10, this.trait.rank, `x10`));

        // Advantage and disadvantage
        roll.checkAdvantage(options.advantage);

        // Apply any final bonuses from the situational options

        LOGGER.debug("Roll", roll);
        // Rolls the dice
        roll.roll(options);
    }
}

