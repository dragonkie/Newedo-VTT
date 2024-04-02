import LOGGER from "./logger.mjs";
export default class sysUtil {

    /**
  * Localize a string using internationalization.
  * 
  * this format calls the game.i18n.localize(), but is more convinient and easier to understand
  * @param {string} str - The string to localized
  * @returns {string} The localized string
  */
    static Localize(str) {
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
            penalty = 1;
        }
        if (value <= 0.75) {
            label = `NEWEDO.wound.wounded`;
            penalty = 3;
        }
        if (value <= 0.25) {
            label = `NEWEDO.wound.bloody`;
            penalty = 5;
        }
        if (value <= 0.10) {
            label = `NEWEDO.wound.beaten`;
            penalty = 7;
        }
        if (value <= 0.0) {
            label = `NEWEDO.wound.burning`;
            penalty = 10;
        }

        return {
            label: this.Localize(label),
            penalty: penalty
        }
    }

    static clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }

    static notify(message) {
        ui.notifications.notify(this.Localize(message));
    }

    static warn(message) {
        ui.notifications.warn(this.Localize(message));
    }

    static error(message) {
        ui.notifications.error(this.Localize(message));
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
    static async spendLegend(actor, cost) {
        if (cost > 0) {
            if (actor.system.legend.value >= cost) {
                // Has enough legend to spend
                console.log(`spent ${cost} legend`)
                actor.update({ 'system.legend.value': actor.system.legend.value - cost });
                return cost;
            } else {
                // Doesnt have enough legend to spend
                this.warn(`NEWEDO.notify.warn.noLegend`);
                return null;
            }
        } else return '';
    }
}