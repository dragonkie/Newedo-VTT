import LOGGER from "../../../helpers/logger.mjs";
import NewedoItem from "../item.mjs";
import sysUtil from "../../../helpers/sysUtil.mjs";
import { Dice, NewedoRoll } from "../../../helpers/dice.mjs";

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
        const list = skill.dice();
        list.unshift(new Dice(10, trait.rank, "x10"));
        return list;
    }

    async roll() {
        
    }
}