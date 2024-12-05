import LOGGER from "./logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";
import { actor } from "../data/_module.mjs";

/**
 * Expanded roll option for use with the vast number of dice used in newedo
 * This is mostly for ease of use adding and removing dice from the roll
 * allows the formula given in chat to be condensed down into easy to read
 * formats despite containg potentially 10+ different dice and multiple modifier
 * sources
 */
export class NewedoRoll {

    data = {};

    options = {};

    _ready = false;

    formula = '';

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

                // special handling for the legend option since it spends a resource
                if (element.dataset['formula'] == 'legend' && this.data.actor && v.value != '0') {
                    if (sysUtil.spendLegend(this.data.actor, sysUtil.parseElementValue(v))) {
                        // spent legend properly
                        this.options.pieces.push({
                            type: element.dataset['formula'],
                            value: sysUtil.parseElementValue(v),
                            active: true,
                        })
                    } else {
                        // ran out of legend so abort
                        sysUtil.warn('NEWEDO.warn.noLegend');
                        return null;
                    }
                } else {
                    if (v && a && v.value != '' && v.value != '0') this.options.pieces.push({
                        type: element.dataset['formula'],
                        value: sysUtil.parseElementValue(v),
                        active: a ? a.checked : true,
                    })
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
            LOGGER.debug('dialog opts', options)
            new foundry.applications.api.DialogV2(options, null).render(true);
        });
    }

    // Pointer to the evaluate function, maintains parity with foundry rolls
    async roll() {
        return this.evaluate();
    }

    /**
     * Creates and rolls the values gotten here
     */
    async evaluate() {
        if (this.options.cancelled) {
            return null;
        }

        if (!this._ready) {
            LOGGER.error('NewedoRoll not initalized, roll needs to have options set and be flagged as ready')
            return null;
        }

        for (let part of this.options.pieces) {
            // if the formula has a piece in it already, add osmething to join them
            if (!part.active) continue;
            if (this.formula != '') {
                switch (Array.from(part.value)[0]) {
                    case '+':
                    case '/':
                    case '-':
                    case '*':
                        break;
                    default:
                        this.formula += '+';
                        break;
                }
            }

            this.formula += part.value;
        }

        // Removes exploding dice and whitespace for simplicity
        this.formula = this.formula.replaceAll('d10x10', 'd10').replaceAll(' ', '');

        // validate the formula before procceeding
        if (!Roll.validate(this.formula)) {
            sysUtil.error('NEWEDO.error.rollValidationFail');
            return null;
        }

        // Regex to grab full dice terms from the formula
        let rx = /[\-\+\*\/]?[0-9]+d[0-9]+([a-zA-Z0-9]?)+/g;
        let terms = this.formula.match(rx);

        // Convert the terms to dice objects for easier management, ordered first to last
        const dice = [];
        for (const t of terms) {

            let c = +t.match(/[0-9]+d/)[0].replace('d', '');
            let f = +t.match(/d[0-9]+/)[0].replace('d', '');
            let s = t.replace(/[0-9]+d[0-9]+([a-zA-Z0-9]?)+/, '');
            let m = t.replace(/^[\-\+\*\/]?[0-9]+d[0-9]+/, '');

            dice.push({
                count: c,
                faces: f,
                sign: s,
                mods: m
            })
        }

        console.log(this.formula);
        console.log(dice);

        let found = false;
        if (this.options.advantage && !this.options.disadvantage) {
            // add 1d10 to an existing stack for roll clarity
            for (let d of dice) {
                if (d.faces == 10) {
                    found = true;
                    d.count += 1;
                    break;
                }
            }
            // if there were no d10s, just add one to the pool
            if (!found) {
                dice.push({
                    count: 1,
                    faces: 10,
                    sign: '+',
                    mods: ''
                })
            }
        } else if (!this.options.advantage && this.options.disadvantage) {
            // attempt to remove 1d10 from the pool
            for (let d of dice) {
                if (d.faces == 10 && d.count > 0) {
                    d.count -= 1;
                    found = true;
                    break;
                }
            }
            // if we dont have d10s, take one away from the largest dice possible
            if (!found) {
                let targetFaces = 0;
                let targetDice = 0;

                for (let a = 0; a < dice.length; a++) {
                    if (dice[a].faces > targetFaces && dice[a].count > 0 && dice[a].sign != '-') {
                        targetDice = a;
                        targetFaces = dice[a].faces;
                    }
                }

                dice[targetDice].count -= 1;
            }
        }

        // Reconstruct the roll formula from the new dice terms
        this.formula = '';
        for (const d of dice) {
            if (d.count == 0) continue;
            this.formula += d.sign + d.count + "d" + d.faces + d.mods;
        }

        // Adds the exploding dice back
        this.formula = this.formula.replaceAll('d10', 'd10x10');

        let roll = new Roll(this.formula);

        await roll.evaluate();
        roll.toMessage();
    }
};