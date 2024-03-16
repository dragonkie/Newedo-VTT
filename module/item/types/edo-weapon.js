import sysUtil from "../../utility/sysUtil.mjs";
import NewedoItem from "../edo-item.mjs";
import NewedoSkill from "./edo-skill.js";
import { Dice, NewedoRoll } from "../../utility/dice.js";

export default class NewedoWeapon extends NewedoItem {
    constructor(data, options) {
        super(data, options);
    }

    prepareDerivedData() {
        //grabs data structure variables
        const system = this.system;

        // Corrects quality values
        if (system.quality.value > system.quality.max) system.quality.value = system.quality.max;
        if (system.quality.value < 1) system.quality.value = 1;
        // Corrects grit values
        if (system.grit.value > system.quality.value * 2) system.grit.value = system.quality.value*2;// Maximum grit is the quality of the weapon * 2
        if (system.grit.value < 0) system.grit.value = 0;// Minimum of 0 grit
        // If the grit modifiers are higher than what the grit allows, lowers them evenly until they are acceptable
        while (system.grit.atk + system.grit.dmg > Math.floor(system.grit.value / 2)) {
            if (system.grit.atk > system.grit.dmg) system.grit.atk -= 1;
            else system.grit.dmg -= 1;
        }
        // clears the formulas to make sure no garbage is in them
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
        system.attack.formula = this.atkFormula;
        system.damage.formula = this.dmgFormula;
    }

    async roll() {
        // Because were using a weapon to roll, we need to create 2 seperate rolls
        // One is for attacks, and the other is a delayed one to be rolled for damage
        var data = {
            title : this.name,
            label : this.name,
			actor : this.actor,
			item : this
		};

        var rSkill = new NewedoRoll(data);
        rSkill.roll();
    }

    get atkFormula() {
        const system = this.system;
        const skill = this.getSkill;// Gets the skill item
        const trait = this.trait;

        if (!skill) return ``;

        var formula = skill.formula;
        if (system.grit.atk > 0) formula += (formula === ``) ? `${system.grit.atk}` : (`+${system.grit.atk}`);

        return formula;
    }

    get dmgFormula() {
        const system = this.system;
        const skill = this.getSkill;// Gets the skill item
        const trait = this.trait;
        var formula = ``;

        if (!system.isRanged) formula += `${trait.rank}d10`;
        formula += (formula===``) ? `${system.damage.value}`: `+${system.damage.value}`;

        return formula;
    }

    /** Returns the skill item this weapon uses if the owning actor has it
     * @returns {NewedoSkill | undefined}
    */
    get getSkill() {
        if (this.actor) {
            return this.actor.getSkill(this.system.skill);
        } else {
            return undefined;
        }
    }

    /** Returns the value of the trait and its rank
     * @returns {[Label, Rank]}
     */
    get trait() {
        if (this.actor) {
            return this.getSkill.getTrait;
        }
        return undefined
    }
}