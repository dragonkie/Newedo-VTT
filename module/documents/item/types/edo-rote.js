import LOGGER from "../../../system/logger.mjs";
import NewedoItem from "../edo-item.mjs";
import sysUtil from "../../../system/sysUtil.mjs";
import { Dice, NewedoRoll } from "../../../system/dice.mjs";

export default class NewedoRote extends NewedoItem {
    constructor(data, options) {
        super(data, options);
    }

    prepareDerivedData() {
        let system = this.system;
        let rollData = this.getRollData(); //rolldata holds all the info needed from the parent actors
        const actor = this.actor;

        //resets the formula to be empty just in case it wasn't
        system.formula = ``;

        if (actor) {
            // Get the actors shinpi rank
            const shinpi = actor.system.traits.core.shi;
            if (shinpi.rank > 0) system.formula = `${shinpi.rank}d10`;

            // Get the asoiated skill dice
            const skill = actor.getSkill(this.system.skill);
            if (skill) {
                if (system.formula !== ``) system.formula += `+`;
                system.formula += skill.diceFormula;
            }
        }
    }

    get skill() {
        if (this.actor) return this.actor.getSkill(this.system.skill);
        return undefined;
    }

    get trait() {// Rotes always return the shinpi trait
        if (this.actor) return this.actor.system.traits.core.shi;
        return undefined;
    }

    get dice() {// Returns an array of dice objects
        const actor = this.actor;
        if (!actor) return null;
        const skill = this.skill;
        const trait = this.trait;
        const list = skill.dice;
        list.unshift(new Dice(10, trait.rank, "x10"));
        return list;
    }

    async roll() {
        if (!this.actor) {
            sysUtil.warn(`NEWEDO.notify.warn.noActor`);
            return null;
        }

        const template = `systems/newedo/templates/dialog/roll/dialog-roll-rote.hbs`;
        const rollData = this.getRollData();
        const actor = this.actor;
        const shinpi = this.trait;

        LOGGER.debug("Rote roll data:", rollData);

        // Creates the popup dialog asking for your roll data
        const options = await sysUtil.getRollOptions(rollData, template);
        if (options.canceled) return null;// Stops the roll if they decided they didnt want to have fun

        // Create a new roll instance
        const roll = new NewedoRoll;

        /* --- Proccess the roll data --- */
        // Apply wounds
        if (options.wounded && rollData.wound.penalty < 0) roll.bonuses.push(rollData.wound.penalty);

        // Spend legend from the spell cost and any roll enhancment
        if (await sysUtil.spendLegend(actor, options.legend + this.system.cost) === null) {
            sysUtil.warn("NEWEDO.notify.notEnoughLegend");
            return null;
        }
        if (options.legend > 0) roll.bonuses.push(options.legend);

        // Add skill dice
        roll.dice = roll.dice.concat(this.dice);

        // Add trait dice
        if (options.useTrait) roll.dice.unshift(new Dice(10, this.trait.rank, `x10`));

        // Advantage and disadvantage
        roll.checkAdvantage(options.advantage);

        // Apply any final bonuses from the situational options
        if (options.bonus != ``) roll.addon = options.bonus;

        LOGGER.debug("Roll", roll);
        // Rolls the dice
        roll.toRollMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<p style="font-size: 14px; margin: 4px 0 4px 0;">${this.name}</p>`
        });
    }
}