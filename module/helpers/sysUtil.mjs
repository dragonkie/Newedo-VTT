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
     * 1 - Notification
     * 2 - Warning
     * 3 - Error
     * @param {String} msgType - The type of notification to show
     * @param {String} msg - Text for the notification
     */
    static async notification(msg, msgType = 0) {
        switch (msgType) {
            case 0:
                ui.notifications.notify(msg);
                LOGGER.log(msg);
                break;
            case 1:
                ui.notifications.warn(msg);
                LOGGER.warn(msg);
                break;
            case 2:
                ui.notifications.error(msg);
                LOGGER.error(msg);
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
        let label = 'NEWEDO.wound.healthy'
        let penalty = 0;

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
            value: penalty
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
        const data = {};
        for (const element of matches) {
            // Parse the input data based on type
            data[element.name] = this.parseElementValue(element);
        }

        return data;
    }

    static parseElementValue(element) {
        // Parse the input data based on type
        switch (element.type) {
            case 'number':// Converts a string to a number
            case 'range':
                return +element.value;
            case 'checkbox':// Returns boolean based on if the box is checked
                return element.checked;
            default:// Other values are taken in as strings
                return element.value;
        }
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
        LOGGER.log('Got roll options data', data);
        const title = data.title ? data.title : "NEWEDO.generic.roll";
        const render = await renderTemplate(template, data);

        /**
         * Small internal function to handel the data form we recieve
         * @param {*} html 
         * @param {*} method 
         * @returns 
         */
        const handler = (html, method) => {
            const f = this.getFormData(html, "[name]");
            const d = { advantage: false, disadvantage: false, ...f };// spreads the form data across this new object

            // sets hte advantage / disadvantage of the roll options
            if (method == 'advantage') d.advantage = true;
            if (method == 'disadvantage') d.disadvantage = true;

            // Ensures the number text in the bonus field is valid for the roll
            if (d.bonus && d.bonus != "" && !Roll.validate(d.bonus)) {
                sysUtil.warn("NEWEDO.warn.invalidBonus");
                d.cancelled = true; // Flags that this roll should be discarded
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
                close: () => resolve({ cancelled: true }),
                submit: (result) => resolve(result)
            }
            LOGGER.debug('dialog opts', options)
            new foundry.applications.api.DialogV2(options, null).render(true);
        });
    }

    static rayCollision(a, b) {
        const A = canvas.tokens.placeables.find(t => t.name === a);
        const B = canvas.tokens.placeables.find(t => t.name === b);

        const ray = new Ray({ x: A.x, y: A.y }, { x: B.x, y: B.y });
        const collisions = WallsLayer.getWallCollisionsForRay(ray, canvas.walls.blockVision);
        return collisions.length > 0;
    }
}