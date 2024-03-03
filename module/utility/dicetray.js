import LOGGER from "./logger.mjs";

/**
 * Dice class used by all dicetray functions, these dice can be created in 2 ways, as generic, or advanced dice
 * Generic dice only need a numeric value assigned to them
 * advanced dice can have an array of their different face values, allowing for weighted dies
 * such as a d6 with the faces [1,2,3,4,6,6]
 */
export class Dice {
    constructor(faces=6, count=1, mod=``) {
        this.count = count;//the number of this kind of dice, lets you hold multiple dice in one object
        this.faces = faces;//the number of sides to the die
        this.mod = mod;
    }
    /**Converts the dice to a readable string for foundry
     */
    formula() {
        return `${this.count}d${this.faces}${this.mod}`;
    }
};

export class Dicetray {
    /**Accepts an optional list of dice objects to pre populate the tray */
    constructor(diceList) {
        if (Array.isArray(diceList)) this.tray = [...diceList];//array that stores all of the dice in it
        else this.tray = [];
    }

    /**Converts the tray into a rollable string that is foundry compatible
     */
    get formula() {
        //checks if the dice tray is a valid array, if its not, returns a blank formula
        if (!this.validate(`FORMULA`)) return ``;
        //loops through the pool of dice and adds them in to the stringified formula
        var first = true;
        var formula = ``;
        for (const d of this.tray) {
            if (!first) formula += `+`;
            formula += d.formula();
            first = false;
        }
        return formula;
    }
     get roll() {

    }
    /**Returns the dice object that matchs the number of faces inputed */
    getDice(dice) {
        for (const a = 0; a < this.tray.length; a++) {
            if (this.tray[a].faces === dice) return this.tray[a];
        }
        return undefined;
    }
    /**Check to make sure the tray has entries and is an array
     * returns true or false if validation fails or succeeds
     * @param {bool} scope string of text for the debug message if the tray fails validation
    */
    validate(scope=``) {
        if ( !Array.isArray(this.tray) || this.tray.length < 1 ) {
            LOGGER.debug(`DICETRAY | VALIDATE | FAILED | ${scope}`);
            return false;
        }
        return true;
    }
    /**Cleans the dicetray of any invalid values
     * will be called after most functions that add or remove dice
     */
    clean(sort=false) {
        var t = this.tray;
        //ensures the array exists
        if (!this.validate(`CLEAN | START`)) return 0;
        const l = t.length;

        for (var a = 0; a < l; a++) {
            //removes any elements from the tray that arent a Dice object
            if (typeof t[a] !== `object`) t[a] = undefined;

            for (var b = 0; b < l; b++) {
                if (a === b) continue;
                if (typeof t[a] !== `object`) continue;
                if (typeof t[b] !== `object`) continue;
                //if the 2 dice sets are of the same kind of dice
                if (t[a].faces == t[b].faces && t[b].count > 0) {
                    t[a].count += t[b].count;
                    t[b].count = 0;
                }
            }
        }
        this.tray = t.filter((dice) => dice.count > 0);
        if (!this.validate(`CLEAN | END`)) return 0;
        if (sort) this.sort();
    }
    /**Sorts the dice based on the input, different numbers repersent different methods
     * 1 -> low to high
     * 2 -> high to low
    */
    sort(dir=1) {
        if (dir===1) t.sort((a, b) => {return a.faces-b.faces});
        else t.sort((a, b) => {return b.faces-a.faces});
    }
    /**Accepts an integer or an array to be converted into dice */
    add(list) {
        //concat returns the new array, so calling it with no entries creates a shallow copy
        const tray = this.tray;
        var diceList = list.concat();
        this.clean();
        if (Array.isArray(diceList)) {
            for (var a = 0; a < diceList.length; a++) {
                //loops through the dice being added
                if (diceList[a] < 2) continue;
                if (!this.validate()) {
                    tray.push(new Dice(diceList[a], 1));
                    diceList[a] = 0;
                } else {
                    var found = false;
                    for (var b = 0; b < tray.length; b++) {
                        //steps through the dice tray, checking for which dice should be added to it
                        if (tray[b].faces == diceList[a]) {
                            //if the existing dice is found, increase its counter
                            tray[b].count += 1;
                            //sets the new dice list to be -1 so its ignored in a future check
                            diceList[a] = 0;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        tray.push(new Dice(diceList[a], 1));
                        diceList[a] = 0;
                    }
                }
            }
            return 0;
        } else {
            if (diceList[a] < 2) return 0;
            if (!this.validate()) {
                tray.push(new Dice(diceList[a], 1));
                return true;
            } else {
                for (var a = 0; a < tray.length; a++) {
                    //loops through the dice being added
                    if (tray[a].faces === diceList) {
                        tray[a].count += 1;
                        return true;//returns if the value is found, ending the loop
                    }
                }
                tray.push(new Dice(diceList, 1));
            }
        }
        return false;
    }

    /**adds a given number of dice to the least big pile of dice
     * @param {Number} count the number of dice to be added
    */
    addLowest(count) {
        if (!this.validate(`ADD | LOWEST`)) return false;
        const tray = this.tray;
        var value = Infinity;
        var index = -1;
        for (var a = 0; a < tray.length; a++) {
            //loops through the dice being added
            if (tray[a].faces < value) {
                value = tray[a].faces;
                index = a;
            }
        }
        if (index >= 0) {
            tray[index].count += count;
            return true;
        } else return false;
    }
    /**Adds the given number of dice to the one that already has the highest count
     * @param {Number} count the number of dice to be added
    */
    addHighest(count) {
        if (!this.validate(`ADD | HIGHEST`)) return false;
        const tray = this.tray;
        var value = 0;
        var index = -1;
        for (var a = 0; a < tray.length; a++) {
            //loops through the dice being added
            if (tray[a].faces > value) {
                value = tray[a].faces;
                index = a;
            }
        }
        if (index >= 0) {
            tray[index].count += count;
            return true;
        } else return false;
    }

    /**Removes the numeric array from the dice pool, or individual entry
     * if a value isn't found, it will be ignored
     */
    drop(dice) {
        const tray = this.tray;
        
        if (!this.validate(`DROP`)) {
            return false;
        }
        if (Array.isArray(dice)) {
            var list = dice.concat();
            var found = false;
            for (const a = 0; a < list.length; a++) {
                for (const b = 0; b < tray.length; b++) {
                    if (tray[b].faces === list[a] && tray[b].count > 0) {
                        tray[b].count -= 1;
                        list[a] = 0;
                        found = true;
                    }
                }
            }
            return found;
        }
        else {
            for (const a = 0; a < tray.length; a++) {
                if (tray[a].faces === dice && tray[a].count > 0) {
                    tray[a].count -= 1;
                    return true;
                }
            }
            return false;
        }
    }
    /**Drops a number of the largest dice from the pool, will exit if the array is empty
     * This function is universal to all dice, if it runs out of d20's, it moves down to d12, d10, etc...
     * returns false if the dicetray is invalid, having no dice left, or true if it was successful
     * @param {Number} count The number of dice to be dropped
     */
    dropHighest(count) {
        const tray = this.tray;
        var value = 0;
        var index = -1;
        for (var x = 0; x < count; x++) {
            if (!this.validate(`DROP | HIGHEST`)) return false;
            for (var a = 0; a < tray.length; a++) {
                //loops through the dice being added
                if (tray[a].faces > value) {
                    value = tray[a].faces;
                    index = a;
                }
            }
            if (index >= 0) {
                tray[index].count -= 1;
                this.clean();
            }
        }
        return true;
    }
    /**Drops a number of the smallest dice from the pool, will exit if the array is empty
     * This function is universal to all dice, it will mvoe up dice sizes if it runs out of the current one
     * returns false if the dicetray is invalid, having no dice left, or true if it was successful
     * @param {Number} count The number of dice to be dropped
     */
    dropLowest(count) {
        const tray = this.tray;
        var value = Infinity;
        var index = -1;
        for (var x = 0; x < count; x++) {
            if (!this.validate(`DROP | LOWEST`)) return false;
            for (var a = 0; a < tray.length; a++) {
                //loops through the dice being added
                if (tray[a].faces < value) {
                    value = tray[a].faces;
                    index = a;
                }
            }
            if (index >= 0) {
                tray[index].count -= 1;
                this.clean();
            }
        }
        return true;
    }
};