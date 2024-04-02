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
        if (!this.actor) {
            ui.notifications.warn(`NEWEDO.notify.item.roll.weapon.noActor`)
            return undefined;
        }
        var data = {
            title : this.name,
			actor : this.actor,
			item : this
		};

        //var rSkill = new NewedoRoll(data);
        //rSkill.roll();
        const atk = new Roll(this.atkFormula.replace(`d10`, `d10x10`));
        await atk.evaluate();

        const dmg = new Roll(this.dmgFormula.replace(`d10`, `d10x10`));
        await dmg.evaluate();

        const html = {
            atk: await atk.render(),
            dmg: await dmg.render()
        }

        let msg = await atk.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<div style="font-size: 20px; text-align: center;">${this.name} Attack</div>`,
            content: [html.atk]+`<div>Damage</div>`+[html.dmg],
            create: true,
            rollMode: game.settings.get('core', 'rollMode')
        });
    }

    async rollAttack() {

    }

    async rollDamage() {

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