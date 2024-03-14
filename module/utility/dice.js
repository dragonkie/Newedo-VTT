import LOGGER from "./logger.mjs";
import NewedoDialog from "../dialog/edo-dialog.js";

export class NewedoRoll {
    /**Accepts an optional list of dice objects to pre populate the tray */
    constructor(data) {
        this.dice = [];
        this.faces = [];//list of the dice faces that were rolled

        this._roll = null;//reference to the foundry roll object
        this.critical = false;//if the roll is a critical hit
        this.options = null;
        
        //determin what kind of roll this is based on the context of what was passed through as data
        this.actor = data.actor;
        this.item = data.item;
        this.template = ``;

        if (this.item) {
            //if the roll type was manually passed through, skip checking for context clues about what the role should be
            switch (this.item.type) {
                case "skill":
                    if (this.actor !== undefined && this.item !== undefined) {
                        this.template = "systems/newedo/templates/dialog/dialog-roll-skill.hbs";
                        var ranks = this.item.system.ranks;
                        var trait = this.actor.system.traits.core[`${this.item.system.trait}`].rank;
                        this.add(new Dice(10, trait, `x10`));
                        this.add(ranks);
                    }
                    break;
                default:
                    break;
            }
        } else {
            if (this.item !== undefined) {
                
                
            }
        }
    }

    /**
     * Converts the tray into a rollable string that is foundry compatible
     */
    get formula() {
        //checks if the dice tray is a valid array, if its not, returns a blank formula
        if (this.isEmpty) return ``;
        //loops through the pool of dice and adds them in to the stringified formula
        var first = true;
        var formula = ``;
        for (const d of this.dice) {
            if (!first) formula += `+`;
            formula += d.formula;
            first = false;
        }
        return formula;
    }
    /* ------------------------------------------------------- THE IMPORTANT FUNCTION ---------------------------------------------------------*/
    async roll() {
        //compile the roll data based on the context, or based of the roll type

        //dialog prompt to get the options from players
        const options = await getRollOptions(this);
        if (options.canceled) return 0;
        //if an actor belongs to this roll, and the player toggled to have their fate rolled
        if (this.actor !== undefined && options.fate) {
            LOGGER.debug("Actor:", this.actor.sheet);
            await this.actor.sheet._rollFate();
        }

        switch (options.advantage) {
            case "advantage":
                //add a d10 to the pool
                LOGGER.debug(`Rolling with advantage`);
                this._advantage();
                break;
            case "disadvantage":
                //drop one of the highest dice available, or a d10 if there is one
                LOGGER.debug(`Rolling with disadvantage`);
                this._disadvantage();
                break;
        }

        //create the foundry roll object
        let formula = this.formula;
        if (options.legend.value > 0 && this.actor !== undefined) {
            if (!Number.isInteger(Number(options.legend.value))) {
                ui.notifications.warn(`Legend spent must be an integer`)
                return -1;
            }
            else if (this.actor.system.legend.value >= options.legend.value) {
                formula += `+ ${options.legend.value}`
                var newValue = (this.actor.system.legend.value - options.legend.value);
                await this.actor.update({ "system.legend.value": newValue });
            } else {
                ui.notifications.warn(`You can't spend legend you don't have`);
                return -1;
            }
        } 
        //checks if the formula actually exists and has dice in it
        if (formula === ``) {
            ui.notifications.warn(`Can't make a roll with empty formula`);
            return -1;
        }
        let roll = new Roll(formula);
        let result = await roll.evaluate();//actually rolls the dice
        let render = await roll.render();//gets the default roll html to render

        let msg = await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor}),
            flavor: "<div style=\"font-size: 18px; text-align: left;\">",
            content: [render],
            create: true,
            rollMode: game.settings.get('core', 'rollMode')
        });
    }

    get isEmpty() {
        if (!Array.isArray(this.dice) || this.dice.length < 1) return true;
        return false;
    }
    /**Cleans the roll of any invalid values
     * will be called after most functions that add or remove dice
     * @param {Boolean} sort Default false, wether the dice should be sorted after the clean is finished
     */
    clean(sort=false) {
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
    /**Accepts an integer or an array to be converted into dice 
     * @param {integer, array} dice accepts integer, or array of them, and dice objects
    */
    add(dice) {
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
                LOGGER.debug(`Added Integer dice to list: `, dice);
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

    /**
     * Drops 1d10 from the pool. if no d10's are present, drops one of the largest dice
     */
    _disadvantage() {
        var d10 = this.find(10);
        if (d10 !== undefined) {
            LOGGER.debug(`dropping d10:`, d10);
            d10.count -= 1;
        } else this.dropHighest();
        this.clean;
    }

    /**
     * Searches for a dice based on given specifiers
     * @param {Number} faces number of sides of the dice to get
     * @param {String} mod Modifiers applied to this dice
     * @returns {Dice} undefined if a dice was not found
     */
    find(faces, mod=``) {
        LOGGER.debug(`Searching for dice: d${faces}`);
        if (this.isEmpty) return undefined;//if the dicetray doesnt have dice, exit the function
        for (var a = 0; a < this.dice.length; a++) {
            if (this.dice[a].faces === faces) {
                if (mod === `` || this.dice[a].mod === mod) {
                    LOGGER.log("Found a dice:", this.dice[a])
                    return this.dice[a];
                }
            }
        }
        //no dice matched the given specifiers

        return undefined;
    }

    /**Drops a number of the largest dice from the pool, will exit if the array is empty
    * if dropping multiple dice, it will check through all dice types
    * if hte largest pool runs out but more dice are available, it will drop the next highest
    * @param {Number} count The number of dice to be dropped
    * @returns {Boolean} true if a dice is removed, false if it failed
    */
    dropHighest(count=1) {
        if (this.isEmpty) return false;//if the roll has no dice, cancel
        const dice = this.dice;
        var value = 0;
        var index = -1;
        //repeats a number of times equal to the param, dropping the largest available dice in descending order
        for (var x = 0; x < count; x++) {
            //cycles through the available dice
            for (var a = 0; a < dice.length; a++) {
                //checks if this dice is larger than the previous best, and there are dice available
                if (dice[a].faces > value && dice[a].count > 0) {
                    //if this dice is larger than the previous one, select it as the dice to be dropped
                    value = dice[a].faces;
                    index = a;
                }
            }
            //if a dice was found, drop its value
            if (index >= 0) {
                dice[index].count -= 1;
            } else break;//catch for if the function didn't find any available dice, and breaks the loop
        }
        //cleans up the array when were done with it
        this.clean();
        //returns true if the dice were dropped and there are still dice in the tray
        return true;
    }

    _advantage() {
        return this.add(10);
    }
};

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
        this.mod = mod;//roll modifiers to be added to the end of this dices roll string. if mods are diffrent, 2 dice sets won't be combined
    }
    /**
     * Converts the dice to a readable string for foundry
     */
    get formula() {
        if (this.count === 0) return ``;
        return `${this.count}d${this.faces}${this.mod}`;
    }
};

/**
 * Creates a dialog box to retrieve roll options from the player
 * @param {NewedoRoll} roll of data to construct the final roll from
 * @returns {Promise} The data from the selected options
 * 
 */
async function getRollOptions(data) {
    const html = await renderTemplate(data.template, data);

    return new Promise(resolve => {
        const options = {
            title: "Roll prompt",
            content: html,
            buttons: {
                advantage: {
                    label: "Advantage",
                    callback: (html) => resolve(proccessRoll(html[0].querySelector("form"), "advantage"))
                },
                normal: {
                    label: "Normal",
                    callback: (html) => resolve(proccessRoll(html[0].querySelector("form"), "normal"))
                },
                disadvantage: {
                    label: "Disadvantage",
                    callback: (html) => resolve(proccessRoll(html[0].querySelector("form"), "disadvantage"))
                }
            },
            close: () => resolve({canceled: true})
        }
        new NewedoDialog(options, null).render(true);
    });
}

/**
 * prepares all the submitted data from the getRollOptions dialog box
 * @param {*} form 
 * @param {*} type 
 * @returns 
 */
function proccessRoll(form, type) {
    const data = {
        advantage: type,
        legend: form.legend
    };
    return data;
}