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
                system.ranged = true;
                break;
            default:
                system.ranged = false;
                break;
        }

        // Checks to see if there is a parent actor
        system.attack.formula = this.atkFormula;
        system.damage.formula = this.dmgFormula;
    }

    async use(action) {
        if (action === 'equip') this._onUseEquip();
        if (action === 'attack') this._onUseAttack();
        if (action === 'damage') this._onUseDamage();
    }

    async _onUseEquip() {
        await this.update({ 'system.equipped': !this.system.equipped });
        LOGGER.log('Equipped Item:', this.system.equipped);
    }

    async _onUseAttack() {
        LOGGER.debug(' --- Weapon Attack --- ');

        // if there isnt an owning actor
        if (!this.actor) return;

        // Gather relevant data
        const actor = this.actor;
        const skill = this.skill;
        const trait = skill.trait;
        const rollData = this.getRollData();

        // Create and parse roll options dialog
        let options = await sysUtil.getRollOptions(rollData, this.constructor.TEMPLATES.attack());
        if (options.cancled) return;
        LOGGER.debug("Roll data:", rollData);
        LOGGER.debug("Roll options:", options);

        let formula = '';// final string parsed formula
        let mods = 0;// total flat bonuses and penalties

        if (options.useTrait) {
            let dice = trait.rank;
            if (options.advantage == 'advantage') dice += 1;
            if (options.advantage == 'disadvantage') dice -= 1;
            if (dice > 0) formula += dice + 'd10x10';
        }

        if (options.skill != '') formula += '+' + options.skill
        if (options.useWound) mods += rollData.wound.value;
        if (options.legend > 0) {
            if (sysUtil.spendLegend(actor, options.legend)) {
                mods += options.legend;
            }
        }

        if (mods > 0) formula += '+'+mods;
        if (mods < 0) formula += mods;

        let r = new Roll(formula);
        await r.evaluate();
        await r.toMessage();
        return r;
    }

    async _onUseDamage() {
        LOGGER.debug('Weapon Damage');
    }

    getRollData() {
        if (!this.actor) return null;
        let data = super.getRollData();

        data.formula = {
            atk: this.atkFormula,
            dmg: this.dmgFormula,
            skill: this.skill.getFormula(false)
        }

        data.skill = this.skill;

        return data;
    }

    get atkFormula() {
        if (!this.isOwned) return undefined;
        const system = this.system;
        const skill = this.skill;// Gets the skill item

        let formula = skill.formula;
        if (system.grit.atk > 0) formula = sysUtil.formulaAdd(formula, system.grit.atk);
        if (system.attack.bonus != 0) formula = sysUtil.formulaAdd(formula, system.attack.bonus);

        return formula;
    }

    get dmgFormula() {
        if (!this.isOwned) return undefined;

        const system = this.system;
        const skill = this.skill;// Gets the skill item
        const trait = skill.trait;

        let formula = ``;
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
        attack: () => `systems/${game.system.id}/templates/dialog/weapon-attack.hbs`,
        damage: () => `systems/${game.system.id}/templates/dialog/weapon-damage.hbs`
    }

    get isRanged() {
        return this.system.ranged == true;
    }

    get isEquipped() {
        return this.system.equipped == true;
    }
}