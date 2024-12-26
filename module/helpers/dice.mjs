import LOGGER from "./logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";

/**
 * Expanded roll option for use with the vast number of dice used in newedo
 * This is mostly for ease of use adding and removing dice from the roll
 * allows the formula given in chat to be condensed down into easy to read
 * formats despite containg potentially 10+ different dice and multiple modifier
 * sources
 */
export default class NewedoRoll {

    data = {};

    options = {};

    _ready = false;

    formula = '';

    _roll = null;

    /**Accepts an optional list of dice objects to pre populate the tray */
    constructor(data) {
        this.formula = data.formula ? data.formula : '';
        this.data = data;
    }

    static template = 'systems/newedo/templates/dialog/roll-v2.hbs';

    async getRollOptions() {
        const title = sysUtil.localize("NEWEDO.generic.roll") + ": " + sysUtil.localize(this.data.title);
        const render = await renderTemplate(this.constructor.template, this.data);

        /**
         * Small internal function to handel the data form we recieve
         * @param {*} html 
         * @param {*} method 
         * @returns 
         */
        const handler = (html, method) => {
            // Gets all the pieces of the formula
            const formulaParts = html.querySelectorAll("[data-formula]");
            this.options.pieces = [];
            // Get the data from the formula pieces
            for (let element of formulaParts) {
                let v = element.querySelector('[name=value]');
                let a = element.querySelector('[name=active]');

                // validates the user input to make sure the formula is valid, or aborts
                if (element.dataset['formula'] == 'extra') {
                    // Ensures the number text in the bonus field is valid for the roll
                    if (v.value != "" && !Roll.validate(v.value)) {
                        sysUtil.warn("NEWEDO.warn.invalidBonus");
                        this.options.cancelled = true; // Flags that this roll should be discarded
                        return this.options;
                    }
                }

                if (element.dataset['formula'] == 'legend' && this.data.actor && v.value != '0') {
                    // special handling for the legend option since it spends a resource
                    if (sysUtil.spendLegend(this.data.actor, sysUtil.parseElementValue(v))) {
                        // spent legend properly
                        this.options.pieces.push({
                            type: element.dataset['formula'],
                            value: v.value,
                            active: true,
                        })
                    } else {
                        // ran out of legend so abort, they should be alerted by the spend legend function already
                        this.options.cancelled = true;
                        return this.options;
                    }
                } else {
                    // Parses all common roll values
                    if (v && a && v.value != '' && v.value != '0') {
                        this.options.pieces.push({
                            type: element.dataset['formula'],
                            value: v.value,
                            active: a ? a.checked : true,
                        })
                    }
                }
            }
            this.options.advantage = method == 'adv' ? true : false;
            this.options.disadvantage = method == 'dis' ? true : false;
            this._ready = true;
            return this.options;
        }

        // the promise constructor provides the resolve and reject functions
        // You can call the resolve or reject function to return the promise with the value provided to the resolve / reject
        this.options = await new Promise((resolve, reject) => {
            const options = {
                window: { title: title },
                content: render,
                buttons: [{
                    label: "Disadvantage",
                    action: 'dis',
                    callback: (event, button, dialog) => resolve(handler(dialog, "dis"))
                }, {
                    label: "Normal",
                    action: 'norm',
                    callback: (event, button, dialog) => resolve(handler(dialog, "normal"))
                }, {
                    label: "Advantage",
                    action: 'adv',
                    callback: (event, button, dialog) => resolve(handler(dialog, "adv"))
                }],
                close: () => resolve({ cancelled: true }),
                submit: (result) => resolve(result)
            }
            new foundry.applications.api.DialogV2(options, null).render(true);
        });

        return this.options;
    }

    // Pointer to the evaluate function, maintains parity with foundry rolls
    async roll() {
        return this.evaluate();
    }

    /**
     * Creates and rolls the values gotten here
     */
    async evaluate() {
        if (this.options.cancelled) return null;

        if (!this._ready) {
            LOGGER.error('NewedoRoll not initalized, roll needs to have options set and be flagged as ready')
            return null;
        }

        // Handle the advantage / disadvantage roll first and foremost
        let adv = this.options.advantage;
        let dis = this.options.disadvantage;

        // Adds all the formula parts
        for (let part of this.options.pieces) {
            // if the formula has a piece in it already, add osmething to join them
            if (!part.active || part.value == 0 || part.value == '') continue; // Skips parts that were marked as inactive, or that are empty
            switch (Array.from(part)[0]) {
                case "/":
                case "+":
                case "*":
                case "*":
                    break;
                default:
                    this.formula += "+";
                    break;
            }

            this.formula += part.value;
        }

        // Cleans the formula, as well as removes exploding dice, and simplifying things
        this.formula = this.formula.replaceAll('d10x10', 'd10').replaceAll(' ', '');
        this.formula = this.formula.replace(/^[\+\*\/]/, '');
        this.formula = this.formula.replaceAll("+-", "-");

        // Adds the advantage / disadvantage bonus
        if (adv && !dis) {
            LOGGER.log('Advantage checks');

            // Search for a positive d10 to add too
            let match = this.formula.match(/(?<![\-\*\/])[0-9]+d10/)[0];
            if (match) {
                let s = match.split("d");
                let n = +s[0];
                this.formula = this.formula.replace(match, `${n + 1}d10`);
            } else {
                // Just add the dice if there wern't any d10's already
                this.formula = "1d10+" + this.formula;
            }
        } else if (dis && !adv) {
            // Search for a positive d10 to lower 
            let term = this.formula.match(/\+?\d+d10(\w+)?/)[0];

            if (term) {
                let dice = term.match(/\dd10/)[0].split('d');
                let count = dice[0];

                if (count < 1) {
                    this.formula = this.formula.replace(term, ``);
                } else {
                    // Create modify the term to match what we need to create
                    let newTerm = term.replace(`${count}d10`, `${count - 1}d10`)
                    this.formula = this.formula.replace(term, newTerm);
                }
            } else {

            }
        }

        this.formula = this.formula.replaceAll('d10', 'd10x10');

        LOGGER.log('Final Formula: ', this.formula)
        this._roll = new Roll(this.formula);

        return this._roll.evaluate();
    }
   
    async rollToMessage() {
        await this.evaluate();
        this._roll.toMessage();
        return this._roll;
    }

    async toMessage(data) {
        if (this._roll) return this._roll.toMessage(data);
        else return null;
    }
};