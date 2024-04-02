import { RollRote } from "../../utility/dice.js";
import LOGGER from "../../utility/logger.mjs";
import NewedoItem from "../edo-item.mjs";

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

    get trait() {// Rotes always return the shinpi stat
        if (this.actor) return this.actor.system.traits.core.shi;
        return undefined;
    }

    async roll() {
        LOGGER.debug(`Rolling skill`);
        if (!this.actor) sysUtil.warn(`NEWEDO.notify.warn.noActor`);

        // List of data needed to roll this item
        const data = {};
        data.type = this.type;
        data.trait = this.trait;
        data.actor = this.actor;
        data.item = this;


        const r = new RollRote(data);
        r.roll();
    }
}