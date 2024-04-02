import LOGGER from "./logger.mjs";
import NewedoDialog from "../dialog/edo-dialog.js";
import sysUtil from "./sysUtil.mjs";

/*
The newedo roll is to cluttered. I need to remove all the nonsense from this thing that is
cluttering it up. 

The issue is that the generic roll here is wasting a lto of time and making a lot of clutter
just trying to organize and sort through the data based off roll type because its not sure which
it should be using, but whenever I create the roll function I already know which kind of roll
it should be so its com pletely redundant for it to be checking again when i already know
what the roll should be, so instead it will act as a basis for a more general roll class
whcich can be extended by an actual roll class specific to each use case

the best way to handel this will be to jsut remove all the calculations and such from teh default roll, and at best leave it with a standard roll function
that just calls the formula getter and rolls whatever that vies
*/


/**Dice class used by all dicetray functions, these dice can be created in 2 ways, as generic, or advanced dice
 * Generic dice only need a numeric value assigned to them
 * advanced dice can have an array of their different face values, allowing for weighted dies
 * such as a d6 with the faces [1,2,3,4,6,6]
 */
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
    constructor(data) {
        this.dice = [];
        this.bonuses = [];// Array of numebrs to be added together in the final formula

        /* Mods are an important part of how the dice system will work each mod is an object storing a bit of data about what it is, and where its from
        a mod can be flat value such as +5, a string "1d8+2d4", or the class Dice();
        during roll calculation, the list of mods is compiled into the final formula, dice are added to the dice list as normal where they are joined with existing dice, or pushed on if they dont have a match
        flat bonuses are compiled down together to maintain legability ex: 1d10+3+4+2+1 -> 1d10+10
        then lastly strings are appended to the very end of the formula with no further proccessing

        mods of any other invalid type will be bypassed, and a warning thrown to the console to help track down where these invalid modifiers are ocming from
        modifiers should typically have a bit of data to explain why theyre there as well
        this includes
            label - such as item features, racial bonuses, equipment unlocks, etc
            origin - a link we can sue to trace our way back to where this bonus came from
            Type - what the modifiers type is, that way if the value is invalid for some reason, we know what it should have been instead
            value - the actual data for the modifier
        */
        this.mods = [];

        // Saves all input data for use later
        this.title = data.title;
        this.actor = data.actor;
        this.item = data.item;

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
        if (bonus > 0) return formula +`+`+bonus;
        if (bonus < 0) return formula + bonus;
        return formula;
    }
    /**Standard role used by backgrounds and traits as they dont need any further options */
    async roll() {
        const options = await this._getRollOptions();
        const data = this.getData();
        // If the roll was cancled
        if (options.canceled) return null;
        // Applies advantage / disadvantage
        this._checkAdvantage(options.advantage);
        // Adds legend bonus to the roll
        const l = sysUtil.spendLegend(this.actor, options.legend);
        if (l === null) return undefined;
        this.bonuses.push(options.legend);
        // Adds wound penalty to the role
        if (options.wounded) this.bonuses.push(-data.wound.penalty);
        // Gets the final roll evaluation
        var formula = this.formula;
        formula = sysUtil.formulaAdd(formula, options.bonus);
        // Sends the roll formula to foundry to evaluate
        const roll = await new Roll(formula).evaluate();
        return roll.toMessage();
    }
    // Function called to quickly get the roll options and pass them this object as the context
    async _getRollOptions() {
        const options = await getRollOptions(this.getData());
        return this._proccessRoll(options);
    }
    //should be overriden by extended classes to proccess their unique data, does nothing here
    _proccessRoll(data) {
        return data;
    }
    /**Returns true or false if there are dice in this roll */
    get isEmpty() {
        if (!Array.isArray(this.dice) || this.dice.length < 1) return true;
        return false;
    }

    get hasBonus() {

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
            LOGGER.debug(`Adding dice array`, dice);
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
            LOGGER.debug(`Adding dice object`, dice);
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
            LOGGER.debug(`Adding integer dice`, dice);
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
    * if dropping multiple dice, it will check through all dice types
    * if hte largest pool runs out but more dice are available, it will drop the next highest
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
    /**Adds a d10 to the dice pool */
    _advantage() {
        return this.add(10);
    }
    /**Drops 1d10 from the dice pool, if there arent any, drops the next highest dice available */
    _disadvantage() {
        var d10 = this.find(10);
        if (d10) d10.count -= 1;
        else this.dropHighest();
        this.clean;
    }

    _checkAdvantage(type) {
        if (type === `advantage`) this._advantage();
        if (type === `disadvantage`) this._disadvantage();
    }
};

/**
 * Creates a dialog box to retrieve roll options from the player
 * This allows a player to give a situational bonus, spend legend, and apply advantage / disadvantage
 * certain roll modes will include other options, such as skills allowing you to opt out from 
 * rolling trait dice
 * @param {NewedoRoll} roll of data to construct the final roll from
 * @returns {Promise} The data from the selected options
 * 
 */
async function getRollOptions(data) {
    LOGGER.debug(`Roll options:`, data);
    const html = await renderTemplate(data.template, data);
    const title = data.title;
    return new Promise(resolve => {
        const options = {
            title: title,
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
            close: () => resolve({ canceled: true }),
            submit: (html) => resolve(proccessRoll(html[0].querySelector("form"), "normal"))
        }
        new NewedoDialog(options, null).render(true);
    });
}

/**
 * prepares all the submitted data from the roll dialog box
 * @param {*} form 
 * @param {*} type 
 * @returns 
 */
function proccessRoll(form, type) {
    const data = {
        form: form,
        advantage: type,

        legend: sysUtil.clamp(form.legend.value, 0, 5),
        bonus: form.bonus.value,
        wounded: form.wounded.checked,
        useTrait: true
    };

    if (form.dataset.rollType === `skill`) data.useTrait = form.useTrait.checked

    LOGGER.debug('Data:', data);
    return data;
}

export class RollSkill extends NewedoRoll {
    constructor(data) {
        super(data);
        this.template = `systems/newedo/templates/dialog/roll/dialog-roll-skill.hbs`; // sets the template we should be using

        if (this.item.type !== `skill`) {
            LOGGER.error(`Cant pass non skil litem to skill roll`);
            return undefined;
        }
    }

    async roll() {
        LOGGER.debug(`Rolling skill`)
        const options = await this._getRollOptions();
        const data = this.getData();

        // Uses dice objects to add traits and ranks etc to the roll
        if (options.useTrait) this.dice.push(new Dice(10, this.item.trait.rank, `x10`));
        this.add(this.item.system.ranks);

        // Apply advantage / disadvantage
        this._checkAdvantage(options.advantage);

        let formula = this.formula;
        // Adds the string modifiers from the input 
        formula = sysUtil.formulaAdd(formula, options.mods);
        formula = sysUtil.formulaAdd(formula, options.bonus);
        // Adds legend bonus
        var l = sysUtil.spendLegend(this.actor, options.legend);
        if (l === null) return undefined;
        formula = sysUtil.formulaAdd(formula, l);
        if (options.wounded) formula = sysUtil.formulaSub(formula, data.wound.penalty);

        // Creates the final roll
        let skill = await new Roll(formula, context).evaluate();
        return await skill.toMessage();
    }

    getData() {
        var data = super.getData();
        data.trait = duplicate(this.item.trait);
        data.trait.label = sysUtil.Localize(`NEWEDO.trait.core.${this.item.system.trait}`);

        data.formula = sysUtil.diceFormula(this.item.dice);

        return data;
    }

    _proccessRoll(data) {
        //prepares the data from the form unique to this roll type
        data.useTrait = data.form.useTrait.checked;
        data.mods = data.form.mods.value;

        return data;
    }
}





export class RollRote extends NewedoRoll {
    constructor(data) {
        super(data);
        this.template = `systems/newedo/templates/dialog/roll/dialog-roll-rote.hbs`; // sets the template we should be using

        // Adds the skill and trait dice to the pool to be used later
        this.skill = data.item.skill;
        this.trait = this.skill.trait;

        if (this.trait.rank > 0) this.add(new Dice(10, this.trait.rank, `x10`));
        this.add(this.skill.system.ranks);

        LOGGER.debug(`Rote dice`, this.dice)

        if (this.item.type !== `rote`) {
            LOGGER.error(`Cant pass non skil litem to rote roll`);
            return undefined;
        }
    }

    getData() {
        var data = super.getData();
        data.shinpi = duplicate(this.item.trait);
        data.shinpi.label = sysUtil.Localize(`NEWEDO.trait.core.shi`);
        data.skill = duplicate(this.skill);
        data.skill.formula = sysUtil.diceFormula(this.skill.dice);

        data.formula = this.formula;

        return data;
    }

    async roll() {
        LOGGER.debug(`Rolling rote`);
        if (this.item.system.cost > this.actor.system.legend.value) {
            
        }

        // Check if the actor has enough legend to cast the rote

        const options = await this._getRollOptions();
        const data = this.getData();

        // Apply advantage / disadvantage
        this._checkAdvantage(options.advantage);

        let formula = this.formula;
        // Adds the string modifiers from the input 
        formula = sysUtil.formulaAdd(formula, options.mods);
        formula = sysUtil.formulaAdd(formula, options.bonus);

        // Adds legend bonus and spell cost
        var l = sysUtil.spendLegend(this.actor, options.legend + this.item.system.cost);
        if (l === null) return undefined;
        l -= this.item.system.cost;
        formula = sysUtil.formulaAdd(formula, l);

        // Adds wound penalty to formula
        if (options.wounded) formula = sysUtil.formulaSub(formula, data.wound.penalty);

        // Creates the final roll
        let skill = await new Roll(formula, context).evaluate();
        return await skill.toMessage();
    }

    _proccessRoll(data) {
        //prepares the data from the form unique to this roll type
        data.mods = data.form.mods.value;
        return data;
    }
}