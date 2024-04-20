import LOGGER from "./logger.mjs";
import NewedoDialog from "../dialog/edo-dialog.js";
import sysUtil from "./sysUtil.mjs";

export class Dice {
    constructor(faces = 6, count = 1, mod = ``) {
        this.count = count;//the number of this kind of dice, lets you hold multiple dice in one object
        this.faces = faces;//the number of sides to the die
        this.mod = mod;//roll modifiers to be added to the end of this dices roll string. if mods are diffrent, 2 dice sets won't be combined
    }
    /**Converts the dice to a readable string for foundry*/
    get formula() {
        if (this.count === 0) return ``;
        return `${this.count}d${this.faces}${this.mod}`;
    }
};

// This roll type can be used for standard rolls such as traits and backgrounds
export class NewedoRoll {
    /**Accepts an optional list of dice objects to pre populate the tray */
    constructor() {
        this.dice = [];
        this.bonuses = [];// Array of numebrs to be added together in the final formula
        this.mods = [];

        this.template = `systems/newedo/templates/dialog/roll/dialog-roll-default.hbs`;
    }

    getData() {
        var data = {};
        data.template = this.template;
        if (this.item) data.item = this.item.toObject();
        if (this.actor) {
            data.actor = this.actor.toObject();
            data.wound = sysUtil.woundState(this.actor.system.attributes.wound.value);
        }
        data.formula = this.formula;
        return data;
    }
    /**Converts the list of dice into a rollable string that is foundry compatible*/
    get formula() {
        // Adds the bonuses array to the formula
        var bonus = 0;// Flate value of numeric bonuses added up
        for (const b of this.bonuses) {
            if (isNaN(b)) continue;
            bonus += b;
        }

        var first = true;
        var formula = ``;
        // Adds the dice array to the formula
        for (const d of this.dice) {
            if (!first) formula += `+`;
            formula += d.formula;
            first = false;
        }

        // Return the final formula
        if (bonus > 0) return formula + `+` + bonus;
        if (bonus < 0) return formula + bonus;
        return formula;
    }
    /**Standard role used by backgrounds and traits as they dont need any further options */
    async roll() {
        // Gets the final roll evaluation
        var formula = this.formula;

        // Sends the roll formula to foundry to evaluate
        const roll = await new Roll(formula).evaluate();
        return roll.toMessage();
    }

    /**quick referenance to the roll function to maintain parity with foundry rolls */
    async evaluate() {
        return await this.roll();
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
            LOGGER.debug(`Cant add non existant dice`);
            return null;
        }
        //concat returns the new array, so calling it with no entries creates a shallow copy preventing us from editing the input array
        /* ---------------------------------- Adding an array of numbers as a list of dice ------------------------------------ */
        if (Array.isArray(dice)) {
            var diceList = duplicate(dice)
            for (var a = 0; a < diceList.length; a++) {
                //loops through the dice being added
                if (diceList[a] < 2) continue;
                if (this.isEmpty) {
                    this.dice.push(new Dice(diceList[a], 1));
                    diceList[a] = 0;
                } else {
                    var found = false;
                    for (var b = 0; b < this.dice.length; b++) {
                        //steps through the dice this.dice, checking for which dice should be added to it
                        if (this.dice[b].faces == diceList[a]) {
                            //if the existing dice is found, increase its counter
                            this.dice[b].count += 1;
                            //sets the new dice list to be -1 so its ignored in a future check
                            diceList[a] = 0;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        this.dice.push(new Dice(diceList[a], 1));
                        diceList[a] = 0;
                    }
                }
            }
            return 0;
        } /* -------------------------------------------- Adding an already formed dice object ------------------------------------*/
        else if (typeof dice === "object" && dice.constructor.name === "Dice") {
            if (this.isEmpty) {//if there are no dice
                this.dice.push(dice);
                return true;
            } else {
                for (var a = 0; a < this.dice.length; a++) {
                    //loops through the dice being added
                    if (this.dice[a].faces === dice.faces && this.dice[a].mod === dice.mod) {
                        this.dice[a].count += 1;
                        return true;//returns if the value is found, ending the loop
                    }
                }
                this.dice.push(dice);
            }
        } /* ------------------------------------Adding in a single number -----------------------------------------------------*/
        else {
            if (this.isEmpty) {
                this.dice.push(new Dice(dice, 1));
                return true;
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
        }
        return false;
    }

    drop(faces, count = 1, mod = ``) {
        var d = this.find(faces, mod)
        if (d) d.count -= count;
        this.clean
        return this.dice;
    }

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

    /**
    * Creates a dialog box to retrieve roll options from the player
    * This allows a player to give a situational bonus, spend legend, and apply advantage / disadvantage
    * certain roll modes will include other options, such as skills allowing you to opt out from 
    * rolling trait dice
    * These are controlled by the different loadable templates
    * @param {NewedoRoll} roll of data to construct the final roll from
    * @returns {Promise} The data from the selected options
    * 
    */
};