import sysUtil from "../../system/sysUtil.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class NewedoItem extends Item {
    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData() {
        // As with the actor class, items are documents that can have their data
        // preparation methods overridden (such as prepareBaseData()).

        //this function is used to ensure all the item data is properly managed, this 
        //includes making any calculations on creation, update, or when loading the server
        //Any items owned by a character will run this function when the server loads
        //when migrating system data, its possible to use prepareData to help manage and correct values alongside the actual migrateData function

        super.prepareData();
    }

    prepareBaseData() {

    }

    prepareDerivedData() {

    }

    /* ----------------------------------- Item prep functions ---------------------------------------------- */

    /**
     * Prepare a data object which is passed to any Roll formulas which are related to this Item
     * @private
     */
    getRollData() {
        // If present, return the actor's roll data.
        const rollData = {};
        if (this.actor) foundry.utils.mergeObject(rollData, this.actor.getRollData());
        // Grab the item's system data as well.
        rollData.item = foundry.utils.deepClone(this.system);
        return rollData;
    }
}
