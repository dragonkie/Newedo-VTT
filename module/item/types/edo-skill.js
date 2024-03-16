import NewedoItem from "../edo-item.mjs";
import { Dice, NewedoRoll } from "../../utility/dice.js";
import LOGGER from "../../utility/logger.mjs";

export default class NewedoSkill extends NewedoItem {
    constructor(data, options) {
        super(data, options);
    }

    prepareDerivedData() {
        console.log(`Preparing Skill data`);
        this.system.formula = this.formula
    }

    get formula() {
        var diceList = [];
        var formula = ``;

        const actor = this.actor;
        if (this.actor) formula = `${actor.system.traits.core[this.system.trait].rank}d10`;
        
        // Loop that converts the array of dice into 
        for (const r of this.system.ranks) {
            //catches empty values and prevents them from adding to the pool
            if (r <= 0) continue;
            //converts the value into a dice string
            const dice = `d${r}`;
            //checks to ensure the dicetray is an array and if it has a value
            if (Array.isArray(diceList) && diceList.length > 0) {
                //loops through the dice tray to check if the given dice is already found in the pool
                var found = false;
                for (const d of diceList) {
                    //if the dice is found, adds to its pile then exits the loop
                    if (d.dice == dice) {
                        found = true;
                        d.count += 1;
                        break;
                    }
                }
                //if no dice exist in the pool, or this type of dice isnt there, add the new dice to the array
                if (!found) diceList.push({dice: dice, count: 1});
            } else diceList.push({dice: dice, count: 1});
        }
        
        //catches if the core trait has already been added to formula, which will mean it needs to add the `+`
        var first = true;
        if (formula !== ``) first = false;
        //loops through the pool of dice and adds them in to the stringified formula
        for (const d of diceList) {
            if (!first) formula += `+`;
            formula += `${d.count}${d.dice}`;
            first = false;
        }
        return formula;
    }

    /** Returns the trait if there is a parent actor */
    get getTrait() {
        const actor = this.actor
        const key = this.system.trait;
        if (actor) {
            return actor.system.traits.core[key];
        }
    }
    /** Returns an array of Dice objects for the skill */
    get getDice() {
        const list = [];
        for (const r of this.system.ranks) {
            if (r === 0) continue;
            var found = false;
            for (var i=0; i< list.length; i++) {
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

    // Creates and rolls a NewedoRoll using this item, giving it the context that this is a skill roll
    async roll() {
        var data = {
            title: this.name,
            label : this.name,
			actor : this.actor,
			item : this
		};

        var rSkill = new NewedoRoll(data);
        rSkill.roll();
    }
}