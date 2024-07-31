import LOGGER from "./logger.mjs";

export default class sysUtil {

    /**
  * Localize a string using internationalization.
  * 
  * this format calls the game.i18n.localize(), but is more convinient and easier to understand
  * @param {string} str - The string to localized
  * @returns {string} The localized string
  */
    static localize(str) {
        return game.i18n.localize(str) ?? str;
    }

    /**
     * Display notifications (These are sometimes displayed globally, and sometimes not, havent figured that out yet)
     *
     * @param {String} msgType - The type of notification to show
     * @param {String} msg - Text for the notification
     */
    static async notification(msg, msgType = 0) {
        switch (msgType) {
            case 1:
                ui.notifications.warn(msg);
                LOGGER.warn(msg);
                break;
            case 2:
                ui.notifications.error(msg);
                LOGGER.error(msg);
                break;
            case 0:
                ui.notifications.notify(msg);
                LOGGER.log(msg);
                break;
            default:
        }
    }

    static async getCompendium(name) {
        return await game.packs.get(name);
    }

    static async getPackDocs(name) {
        return await game.packs.get(name).getDocuments();
    }

    static async getCoreCharDocs() {
        const documents = [];
        const skills = await this.getCoreSkills();
        const fates = await this.getCoreFates();
        return documents.concat(skills, fates);
    }

    static async getCoreSkills() {
        return await this.getPackDocs(`newedo.internal-skills`);
    }

    static async getCoreFates() {
        return await this.getPackDocs(`newedo.internal-fates`);
    }

    static backgroundRank(value) {
        if (value >= 91) return 5;
        else if (value >= 66) return 4;
        else if (value >= 31) return 3;
        else if (value >= 11) return 2;
        // A background cannot drop below one
        return 1;
    }

    static legendRank(value) {
        if (value > 160) return 5;
        if (value > 110) return 4;
        if (value > 75) return 3;
        if (value > 45) return 2;
        return 1;
    }

    static woundState(value) {
        var label = 'NEWEDO.wound.healthy'
        var penalty = 0;

        if (value <= 0.90) {
            label = `NEWEDO.wound.grazed`;
            penalty = -1;
        }
        if (value <= 0.75) {
            label = `NEWEDO.wound.wounded`;
            penalty = -3;
        }
        if (value <= 0.25) {
            label = `NEWEDO.wound.bloody`;
            penalty = -5;
        }
        if (value <= 0.10) {
            label = `NEWEDO.wound.beaten`;
            penalty = -7;
        }
        if (value <= 0.0) {
            label = `NEWEDO.wound.burning`;
            penalty = -10;
        }

        return {
            label: this.localize(label),
            penalty: penalty
        }
    }

    static clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }

    static notify(message) {
        ui.notifications.notify(this.localize(message));
    }

    static warn(message) {
        ui.notifications.warn(this.localize(message));
    }

    static error(message) {
        ui.notifications.error(this.localize(message));
    }

    static formulaAdd(base, string) {
        if (base === ``) return string;
        if (string === ``) return base;
        return base + `+` + string;
    }

    static formulaSub(base, string) {
        if (base === ``) return `-${string}`;
        if (string === ``) return base;
        return base + `-` + string;
    }

    /**converts array of dice objects into a string */
    static diceFormula(list) {
        var formula = '';
        var first = true;
        for (const dice of list) {
            const f = dice.formula;
            if (f === ``) continue;
            if (!first) formula += '+';
            first = false;
            formula += f;
        }

        return formula;
    }

    /**
     * 
     * @param {*} actor 
     * @param {*} cost 
     * @returns {String} returns a string of the legend spent, or null if it couldnt be spent
     */
    static spendLegend(actor, cost) {
        if (cost > 0) {
            if (actor.system.legend.value >= cost) {
                // Has enough legend to spend
                LOGGER.debug(`spent ${cost} legend`);
                actor.update({ 'system.legend.value': actor.system.legend.value - cost });
                return true;
            } else {
                // Doesnt have enough legend to spend, and returns null
                this.warn(`NEWEDO.warn.notEnoughLegend`);
            }
        }
        return false;//returns nothing if there was no legend spent
    }

    static parseDrop(event) {
        return JSON.parse(event.dataTransfer.getData(`text/plain`));
    }

    /**
     * creates a new data object holding the details of the form passed as an argument
     * @argument {FormData} form the element to query
     * @param {String} selectors string of selectors to use
     * @returns 
     */
    static getFormData(form, selectors) {
        const matches = form.querySelectorAll(selectors);
        LOGGER.log(matches)
        const data = {};
        for (const element of matches) {
            // Parse the input data based on type
            switch (element.type) {
                case 'number':// Converts a string to a number
                    data[element.name] = +element.value;
                    break;
                case 'checkbox':// Returns boolean based on if the box is checked
                    data[element.name] = element.checked;
                    break;
                default:// Other values are taken in as strings
                    data[element.name] = element.value;
                    break;
            }
        }

        return data;
    }

    static duplicate(original) {
        return JSON.parse(JSON.stringify(original));
    }

    /**
     * Creates a roll dialog prompt with the the advantage / disadvantage roll buttons
     * @param {*} data Relevant roll data to whats being rendered
     * @param {*} template  Path to the .html or .hbs file to load in, defaults to a standard roll setup for ease of use
     * @returns 
     */
    static async getRollOptions(data, template = `systems/newedo/templates/dialog/roll-default.hbs`) {

        const render = await renderTemplate(template, data);
        const title = data.title;

        /**
         * Small internal function to handel the data form we recieve
         * @param {*} html 
         * @param {*} method 
         * @returns 
         */
        const handler = (html, method) => {
            const f = this.getFormData(html, "[name], [id]");
            const d = { advantage: method, ...f };// spreads the form data across this new object

            // Ensures the number text in the bonus field is valid for the roll
            if (d.bonus && d.bonus != "" && !Roll.validate(d.bonus)) {
                sysUtil.warn("NEWEDO.warn.invalidBonus");
                d.canceled = true; // Flags that this roll should be discarded
            }
            return d;
        }

        // the promise constructor provides the resolve and reject functions
        // You can call the resolve or reject function to return the promise with the value provided to the resolve / reject
        return new Promise((resolve, reject) => {
            const options = {
                window: { title: title },
                content: render,
                buttons: [{
                    label: "Disadvantage",
                    action: 'disadvantage',
                    callback: (event, button, dialog) => resolve(handler(dialog, "disadvantage"))
                }, {
                    label: "Normal",
                    action: 'normal',
                    callback: (event, button, dialog) => resolve(handler(dialog, "normal"))
                }, {
                    label: "Advantage",
                    action: 'advantage',
                    callback: (event, button, dialog) => resolve(handler(dialog, "advantage"))
                }],
                close: () => resolve({ canceled: true }),
                submit: (result) => resolve(result)
            }
            LOGGER.debug('dialog opts', options)
            new foundry.applications.api.DialogV2(options, null).render(true);
        });
    }

    
}