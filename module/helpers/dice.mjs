import LOGGER from "./logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";

export class Dice {
    constructor(term) {
        //regex to convert a dice roll into a number, face count, and modifiers list
        const rx = /(\d+)|(dl\d+)|([^d][a-z]+\d+)/gi;
        const result = term.match(rx);
        this.count = Number(result[0]);//the number of this kind of dice, lets you hold multiple dice in one object
        this.faces = Number(result[1]);//the number of sides to the die
        this.mod = result[2];//roll modifiers to be added to the end of this dices roll string. if mods are diffrent, 2 dice sets won't be combined
    }
    /**Converts the dice to a readable string for foundry*/
    get formula() {
        if (this.count === 0) return ``;
        return `${this.count}d${this.faces}${this.mod}`;
    }
};

/**
 * Expanded roll option for use with the vast number of dice used in newedo
 * This is mostly for ease of use adding and removing dice from the roll
 * allows the formula given in chat to be condensed down into easy to read
 * formats despite containg potentially 10+ different dice and multiple modifier
 * sources
 */
export class NewedoRoll {
    /**Accepts an optional list of dice objects to pre populate the tray */
    constructor() {
        this.dice = [];// List of dice objects on the list
        this.bonus = 0;// Array of numebrs to be added together in the final formula, such as wounds, augs, buffs, and passives
        this.addon = "";// Additional formula bits to append to the final roll
        this._roll = null;
    }

    /**Converts the list of dice into a rollable string that is foundry compatible*/
    get formula() {
        var bonus = this.bonus;
        var first = true;
        var formula = ``;
        // Adds the dice array to the formula
        for (const d of this.dice) {
            if (!first) formula += `+`;
            formula += d.formula;
            first = false;
        }

        // Return the final formula
        if (bonus > 0) formula += `+` + bonus;
        if (bonus < 0) formula += bonus;

        if (this.addon != ``) {
            if (this.addon.charAt(0) != `-` && this.addon.charAt(0) != `+`) {
                formula += `+ ${this.addon}`
            }
            else formula += this.addon;
        }

        return formula;
    }
    /**Standard role used by backgrounds and traits as they dont need any further options */
    async roll() {
        // Gets the final roll evaluation
        var formula = this.formula;
        if (!formula || formula == ``) {
            sysUtil.warn(`NEWEDO.warn.invalidRoll`);
            return null;
        }

        // Sends the roll formula to foundry to evaluate
        this._roll = await new Roll(formula).evaluate();
        return this._roll;
    }

    /**quick referenance to the roll function to maintain parity with foundry rolls */
    async evaluate() {
        return await this.roll();
    }

    async toMessage(options) {
        if (this._roll) return await this._roll.toMessage(options);
        return null;
    }

    // quick use function so you only need to call one instead of 2 functions
    async toRollMessage(options) {
        await this.evaluate();
        return await this.toMessage(options);
    }

    async render() {
        if (this._roll) return await this._roll.render();
    }

    /**Returns true or false if there are dice in this roll */
    get isEmpty() {
        if (!Array.isArray(this.dice) || this.dice.length < 1) return true;
        return false;
    }

    /**Cleans the roll of any invalid values
     * will be called after most functions that add or remove dice
     * @param {Boolean} sort Default false, wether the dice should be sorted after the clean is finished
     */
    clean() {
        var t = this.dice;
        //ensures the array exists
        if (this.isEmpty) return 0;
        const l = t.length;

        for (var a = 0; a < l; a++) {
            //removes any elements from the tray that arent a Dice object
            if (typeof t[a] !== `object`) t[a] = undefined;
            else {
                for (var b = 0; b < l; b++) {
                    if (a === b) continue;
                    if (typeof t[a] !== `object` || typeof t[b] !== `object`) continue;
                    //if the 2 dice sets are of the same kind of dice add them together
                    if (t[a].faces === t[b].faces && t[b].count > 0 && t[a].mod === t[b].mod) {
                        t[a].count += t[b].count;
                        t[b].count = 0;
                    }
                }
            }
        }
        this.dice = t.filter((dice) => dice.count > 0);
        if (this.isEmpty) return 0;
        this.sort();
    }

    /**Sorts the dice list from smallest to highest, but places d10's at the front */
    sort() {
        dice.sort((a, b) => {
            if (a.faces == 10) return -1;//pushes the d10 to the front
            if (b.faces == 10) return 1;
            return a.faces - b.faces;
        });
    }

    /**Accepts an integer or an array to be converted into dice 
     * @param {integer, array} dice accepts integer, or array of them, and dice objects
    */
    add(dice) {
        if (!dice) {
            LOGGER.warn(`Cant add dice that dont exist to roll`);
            return null;
        }
        
        const t = typeof dice;

        if (Array.isArray(dice)) {
            if (dice.length <= 0) return false;
            return this._onAddArray(dice);
        }
        else if (t === 'object' && dice.constructor.name === "Dice") return this._onAddDie(dice);
        else if (t === 'string') return this._onAddString(dice);
        else return this._onAddInt(dice);
    };

    /**
     * Loops through the dice array, calling the add function on all its values
     * @param {Array} dice list of dice to be added
     * @returns 
     */
    _onAddArray(dice) {
        var diceList = foundry.utils.deepClone(dice); // Safely clones the dice list
        for (var a = 0; a < diceList.length; a++) {
            this.add(diceList[a]);
        }
        return 0;
    }

    _onAddInt(dice) {
        if (this.isEmpty) {
            this.dice.push(new Dice(dice, 1));
        } else {
            for (var a = 0; a < this.dice.length; a++) {
                //loops through the dice being added
                if (this.dice[a].faces === dice) {
                    this.dice[a].count += 1;
                    return true;//returns if the value is found, ending the loop
                }
            }
            this.dice.push(new Dice(dice, 1));
        }

        return true;
    }

    _onAddDie(dice) {
        if (this.isEmpty) {
            // when there are no dice in this pool, just add it in
            this.dice.push(dice);
        } else {
            for (var a = 0; a < this.dice.length; a++) {
                //loops through the dice being added
                if (this.dice[a].faces === dice.faces && this.dice[a].mod === dice.mod) {
                    this.dice[a].count += 1;
                    return true;//returns if the value is found, ending the loop
                }
            }
            this.dice.push(dice);// when no dice are found, push this dice in
        }
        return true;
    }

    _onAddString(term) {
        /* Regex references to parse formula */
        const rDie = /(?<!\/)\-?\b\w+\b/gi;// gets all dice instances from the line
        const rTerm = /(\-?\b\d+)d(\d+)([^\s\-\+]*)\b/gi; //seperates them out into their parts

        const mDice = term.match(rx);

        for (const match of matches) {
            const d = new Dice(match);
            this.add(d);
        }

        return matched;
    }

    _onAddTerm() {

    }




    

    drop(faces, count = 1, mod = ``) {
        var d = this.find(faces, mod)
        if (d) d.count -= count;
        this.clean
        return this.dice;
    };

    /** Searches for a dice based on given specifiers
     * @param {Number} faces number of sides of the dice to get
     * @param {String} mod Modifiers applied to this dice
     * @returns {Dice} undefined if a dice was not found
     */
    find(faces, mod = ``) {
        if (this.isEmpty) return undefined;//if the dicetray doesnt have dice, exit the function
        for (var a = 0; a < this.dice.length; a++) {
            if (this.dice[a].faces === faces) {
                if (mod === `` || this.dice[a].mod === mod) {
                    return this.dice[a];
                }
            }
        }
        return undefined; //no dice matched the given specifiers
    }

    /**Drops a number of the largest dice from the pool, will exit if the array is empty
    * @param {Number} count The number of dice to be dropped
    * @returns {Boolean} true if a dice is removed, false if it failed
    */
    dropHighest(count = 1) {
        const dice = this.dice;// array of dice
        var value = 0;//the highest value found of a dice
        var index = -1;//the currently found index to be dropped

        for (var x = 0; x < count; x++) {
            if (this.isEmpty) return; //cancels the function once no more dice are available to drop
            for (var a = 0; a < dice.length; a++) {
                if (dice[a].faces > value && dice[a].count > 0) {
                    value = dice[a].faces;
                    index = a;
                }
            }
            if (index >= 0) {//if a dice was found, drop its value
                dice[index].count -= 1;
            } else break;//if no dice we found, break the loop and procceed to cleanup
        }
        this.clean(); //cleans up the array when were done with it
    }

    checkAdvantage(type) {
        if (type === `advantage`) {
            return this.add(10);
        }
        if (type === `disadvantage`) {
            var d10 = this.find(10);
            if (d10) d10.count -= 1;
            else this.dropHighest();
            this.clean;
        }
    }
};