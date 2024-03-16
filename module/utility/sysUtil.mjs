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
    static async notification( msg, msgType=0 ) {
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
}