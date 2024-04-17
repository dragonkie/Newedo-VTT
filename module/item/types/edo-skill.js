import NewedoItem from "../edo-item.mjs";
import NewedoDialog from "../../dialog/edo-dialog.js";
import { Dice, RollSkill } from "../../utility/dice.js";
import sysUtil from "../../utility/sysUtil.mjs";
import LOGGER from "../../utility/logger.mjs";

export default class NewedoSkill extends NewedoItem {
    constructor(data, options) {
        super(data, options);
    }

    prepareDerivedData() {
        this.system.formula = this.formula
    }
    /**
     * Grabs the full dice formula including an owning actors related trait if the default roll setting includes it
     */
    get formula() {
        var formula = ``;
        // When attached to an actor, check to add their core trait to the skill roll
        if (this.actor) {
            const trait = this.trait;
            if (trait.rank > 0) formula = `${trait.rank}d10`;
        }
        // Get the formula for the skill dice
        const skillDice = this.diceFormula;
        if (skillDice !== '') {
            formula += `+${skillDice}`;
        }

        // Return the fully compiled formula, for just the skill dice, call use: get diceFormula();
        return formula;
    }

    /** Returns the trait if there is a parent actor */
    get trait() {
        const actor = this.actor
        const key = this.system.trait;
        if (actor) return actor.system.traits.core[key];
        ui.notifications.warn(`NEWEDO.notification.warn.skill.noActor`);
        return undefined;
    }
    /** Returns an array of Dice objects for the skill, does not include the trait dice */
    get dice() {
        const list = [];
        for (const r of this.system.ranks) {
            if (r === 0) continue;//skips over dice ranks that dont have a dice
            var found = false;
            for (var i = 0; i < list.length; i++) {
                if (list[i].faces === r) {
                    list[i].count += 1;
                    found = true;
                    break;
                }
            }
            if (!found) list.push(new Dice(r));
        }
        return list;
    }
    /** Returns a formula string just u */
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
        LOGGER.debug(`Rolling skill`);
        if (!this.actor) sysUtil.warn(`NEWEDO.notify.warn.noActor`);

        // List of data needed to roll this item
        const data = {};
        data.type = this.type;
        data.dice = this.dice;
        data.trait = this.trait;
        data.actor = this.actor;
        data.item = this;

        const r = new RollSkill(data);
        r.roll();
    }
}

