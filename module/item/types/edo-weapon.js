import systemUtility from "../../utility/systemUtility.mjs";
import NewedoItem from "../edo-item.mjs";
import NewedoSkill from "./edo-skill.js";


export default class NewedoWeapon extends NewedoItem {
    constructor(data, options) {
        super(data, options);
    }

    prepareDerivedData() {
        //grabs data structure variables
        let system = this.system;

        // Corrects quality values
        if (system.quality.value > system.quality.max) system.quality.value = system.quality.max;
        if (system.quality.value < 1) system.quality.value = 1;
        // Corrects grit values
        if (system.grit.value > system.quality.value * 2) system.grit.value = system.quality.value;// Maximum grit is the quality of the weapon * 2
        if (system.grit.value < 0) system.grit.value = 0;// Minimum of 0 grit
        // If the grit modifiers are higher than what the grit allows, lowers them evenly until they are acceptable
        while (system.grit.atk + system.grit.dmg > Math.floor(system.grit.value / 2)) {
            if (system.grit.atk > system.grit.dmg) system.grit.atk -= 1;
            else system.grit.dmg -= 1;
        }
        // clears the formulas to make sure no garbage is in them
        system.attack.formula = "";
        system.damage.formula = "";
        var skill = null

        switch (system.skill) {
        case `Archery`: 
        case `Gunnery`:
        case `Small Arms`:
            system.isRanged = true;
            break;
        default:
            system.isRanged = false;
            break;
        }

        // Checks to see if there is a parent actor
        const actor = this.actor;

        if (actor) {
            var skill = this._getSkill;
            //ensures that the right skill was found on the actor
            if (skill != null) {
                if (system.isRanged) {
                //adds the perception trait dice to the attack roll
                system.attack.formula += skill.system.formula;
                } else {
                //adds power trait dice to the attack and damage roll
                system.attack.formula += skill.system.formula;
                //adds the power traits dice to the damage
                system.damage.formula += `${this.actor.system.traits.core.pow.rank}d10`;
                }
                //if there is a grit value for attacks, appen it to the attack formula
                if (system.grit.atk > 0) system.attack.formula += (system.attack.formula === ``) ? `${system.grit.atk}` : (` + ${system.grit.atk}`);
        
                //adds the damage dice to the string, if the string has values in it already it will add in the operators
                system.damage.formula += (system.damage.formula === ``) ? `${system.damage.value}` : (` + ${system.damage.value}`);
                if (system.grit.dmg > 0) system.damage.formula += `+${system.grit.dmg}`;
            }
        }
    }

    async roll() {

    }

    get attack() {
        const skill = this._getSkill;
        if (skill) {
            return skill.formula();
        } else return ``;
    }

    get damage() {

    }

    /** Returns the skill item this weapon uses if the owning actor has it
     * @returns {NewedoSkill | undefined}
    */
    get _getSkill() {
        if (this.actor) {
            return this.actor.getSkill(this.system.skill);
        } else {
            return undefined;
        }
    }
}