import sysUtil from "../../../helpers/sysUtil.mjs";
import NewedoItem from "../item.mjs";
import NewedoSkill from "./skill.mjs";
import { Dice, NewedoRoll } from "../../../helpers/dice.mjs";
import LOGGER from "../../../helpers/logger.mjs";

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

    async use(action) {
        if (action === 'attack') this._onUseAttack();
        if (action === 'damage') this._onUseDamage();
    }

    async _onUseAttack() {
        LOGGER.debug('Weapon Attack');

        // if there isnt an owning actor
        if (!this.actor) return;

        // Gather relevant data
        const actor = this.actor;
        const skill = this.skill;
        const trait = skill.trait;
        const rollData = this.getRollData();

        // Create the roll object, all dice need to be added to this object
        const r = new NewedoRoll;

        // Create roll options dialog
        let rollOptions = await sysUtil.getRollOptions(rollData, this.constructor.TEMPLATES.attack());

        // Using the add function for this custom roll will group the dice up for improved legibility
        r.add(skill.dice()); // Skill dice

        // Push to the bonuses
        r.bonus += actor.system.wound.penalty;
        if (rollOptions.legend > 0) {
            var l = sysUtil.spendLegend(actor, rollOptions.legend);
            if (l === 0) return;// tried to spend legend, but didnt have any to give
            r.bonus += l;
        }

        // Adds string from the situational bonus field
        r.addon = rollOptions.bonus;

        // Apply advantage / disadvantage
        r.checkAdvantage(rollOptions.advantage);


        LOGGER.debug("Attack roll object:", rollOptions);
        // Finishes the roll
        await r.evaluate();
        await r.toMessage();
    }

    async _onUseDamage() {
        LOGGER.debug('Weapon Damage');
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

    get atkFormula() {
        if (!this.isOwned) return undefined;
        const system = this.system;
        const skill = this.skill;// Gets the skill item

        var formula = skill.formula;
        if (system.grit.atk > 0) formula = sysUtil.formulaAdd(formula, system.grit.atk);
        if (system.attack.bonus != 0) formula = sysUtil.formulaAdd(formula, system.attack.bonus);

        return formula;
    }

    get dmgFormula() {
        if (!this.isOwned) return undefined;

        const system = this.system;
        const skill = this.skill;// Gets the skill item
        const trait = skill.trait;

        var formula = ``;
        if (!system.isRanged) formula += `${trait.rank}d10`;
        formula = sysUtil.formulaAdd(formula, system.damage.value);
        if (system.grit.dmg > 0) formula = sysUtil.formulaAdd(formula, system.grit.dmg);

        return formula;
    }

    /**
     * Returns the skill item used by this item as found on the owning actor
     */
    get skill() {
        if (this.actor) return this.actor.getSkill(this.system.skill);
        return undefined;
    }

    /**
     * Returns a safe copy of the trait this stat used, determined by it's skill
     */
    get trait() {
        if (this.actor) return this.actor.getSkill(this.system.skill).trait;
        return undefined
    }

    static TEMPLATES = {
        attack : () => `systems/${game.system.id}/templates/dialog/weapon-attack.hbs`,
        damage : () => `systems/${game.system.id}/templates/dialog/weapon-damage.hbs`
    }
}