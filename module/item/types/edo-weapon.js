import sysUtil from "../../utility/sysUtil.mjs";
import NewedoItem from "../edo-item.mjs";
import NewedoSkill from "./edo-skill.js";
import { Dice, NewedoRoll } from "../../utility/dice.mjs";
import LOGGER from "../../utility/logger.mjs";

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
        if (system.grit.value > system.quality.value * 2) system.grit.value = system.quality.value * 2;// Maximum grit is the quality of the weapon * 2
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
        if (!this.actor) {
            sysUtil.warn(`NEWEDO.notify.itemNoActor`);
            return undefined;
        }

        const rollData = this.getRollData();
        const template = `systems/${game.system.id}/templates/dialog/roll/dialog-roll-weapon.hbs`;

        LOGGER.debug("Roll data:", rollData);

        const options = await sysUtil.getRollOptions(rollData, template);
        if (options.canceled) return null;

        const atk = await this._rollAttack(options);
        const dmg = await this._rollDamage(options);
    }

    getRollData() {
        if (!this.actor) return null;
        let data = super.getRollData();

        data.formula = {
            atk: this.atkFormula,
            dmg: this.dmgFormula
        }

        data.skill = this.skill;

        return data;
    }

    async _rollAttack(options) {
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

        // Add situational bonuses
        if (options.bonus != ``) roll.addon = options.bonus;

        // Add skill dice
        roll.dice = roll.dice.concat(this.skill.dice);

        // Add trait dice
        roll.dice.unshift(new Dice(10, this.trait.rank, `x10`));

        // Advantage and disadvantage
        roll.checkAdvantage(options.advantage);

        // Rolls the dice
        await roll.toRollMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<p style="font-size: 14px; margin: 4px 0 4px 0;">${this.name}: Attack</p>`
        });

        return roll;
    }

    async _rollDamage(options) {
        const dmg = new Roll(this.dmgFormula.replace(`d10`, `d10x10`));
        await dmg.evaluate();
        await dmg.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<p style="font-size: 14px; margin: 4px 0 4px 0;">${this.name}: Damage</p>`
        });

        return dmg;
    }

    get atkFormula() {
        const system = this.system;
        const skill = this.skill;// Gets the skill item
        const trait = this.trait;

        if (!skill) return ``;

        var formula = skill.formula;
        if (system.grit.atk > 0) formula = sysUtil.formulaAdd(formula, system.grit.atk);
        if (system.attack.bonus != 0) formula = sysUtil.formulaAdd(formula, system.attack.bonus);

        return formula;
    }

    get dmgFormula() {
        const system = this.system;
        const skill = this.skill;// Gets the skill item
        const trait = skill.trait;

        var formula = ``;
        if (!system.isRanged) formula += `${trait.rank}d10`;
        formula = sysUtil.formulaAdd(formula, system.damage.value);
        if (system.grit.dmg > 0) formula = sysUtil.formulaAdd(formula, system.grit.dmg);

        return formula;
    }

    get skill() {
        if (this.actor) return this.actor.getSkill(this.system.skill);
        return undefined;
    }

    get trait() {
        if (this.actor) return this.skill.trait;
        return undefined
    }
}