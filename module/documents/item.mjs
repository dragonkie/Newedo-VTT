import LOGGER from "../helpers/logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class NewedoItem extends Item {


    /* ----------------------------------------------------------------- */
    /*                    DATA PREPERATION                               */
    /* ----------------------------------------------------------------- */
    prepareData() {
        // As with the actor class, items are documents that can have their data
        // preparation methods overridden (such as prepareBaseData()).

        //this function is used to ensure all the item data is properly managed, this 
        //includes making any calculations on creation, update, or when loading the server
        //Any items owned by a character will run this function when the server loads
        //when migrating system data, its possible to use prepareData to help manage and correct values alongside the actual migrateData function
        LOGGER.group('Document | Item | prepareData | ' + this.name);
        LOGGER.debug('Item:', this);
        if (this.actor) {
            LOGGER.debug('Owned by:', this.actor)
        }
        console.trace();
        super.prepareData();
        LOGGER.groupEnd();
    }

    prepareBaseData() {
        LOGGER.group('prepareBaseData');
        super.prepareBaseData();
        LOGGER.groupEnd();
    }

    prepareDerivedData() {
        LOGGER.group('prepareDerivedData');
        super.prepareDerivedData();
        LOGGER.groupEnd();
    }

    prepareOwnerData(data) {
        LOGGER.group('Document | prepareDerivedData');
        this.system.prepareOwnerData(data);
        LOGGER.groupEnd();
    }

    async deleteDialog(options = {}) {
        const type = sysUtil.localize(this.constructor.metadata.label);
        let confirm = await foundry.applications.api.DialogV2.confirm({
            title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${this.name}`,
            content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.format("SIDEBAR.DeleteWarning", { type })}</p>`,
            options: options
        });

        if (confirm) {
            this.delete();
            return true;
        } else return false;
    }

    /* ----------------------------------- Actions ---------------------------------------------------- */


    /* ----------------------------------- Item prep functions ---------------------------------------------- */

    /**
     * Prepare a data object which is passed to any Roll formulas which are related to this Item
     * @private
     */
    getRollData() {
        LOGGER.debug('Document | Item | getRollData');
        const data = this.system.getRollData();

        return data;
    }

    _generateSlug() {
        return this.update({ 'system.slug': this.name.replace(/\W/g, '').toLowerCase() })
    }
}
