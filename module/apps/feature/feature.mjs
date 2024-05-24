import LOGGER from "../../system/logger.mjs";

/**
 * Class extension for making feature configuration windows
 * This sets up the default functions that will be used by all these traits to create and submit
 * a feature data={options...} object that is submitted to a parent item
 * 
 * FeatureItemConfig
 * ItemChoiceConfig
 * TraitConfig
 * ArmourConfig
 * 
 * All actual form submissions and feature creation is handled here for convinience
 * but all actual data management and form manipulation should be done in the inheriting classes
 */
export default class FeatureConfig extends FormApplication {
    constructor(data, options = {}) {
        super(data, options);

        // Parent item that this config leads too
        if (!data.item) throw new Error(`No item to link feature too`)
        this.item = data.item;
        // Any data we want to be stored inside the data obejct
        this.data = data.data ?? [];
        this.label = data.label ?? null;
        this.type = null
        // Unique id used for the datas map
        this.linkID = data.id ?? randomID();
    }

    /**
     * @override
     * sets new default options for these windows when theyre opened
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["newedo", "feature", "config"],
            template: "systems/newedo/templates/dialog/feature/feature-item.hbs",
            width: 400,
            height: 400,
            submitOnChange: true,
            closeOnSubmit: false,
            dropKeyPath: null,
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
        });
    }

    /**
     * @returns {Object} List of data accesible to the handelbars template renderer
     */
    async getData() {
        const context = {};
        context.label = this.label;
        context.data = this.data;
        return context;
    }
    // The drag start option is here to simply remind us its something that exists
    async _onDragStart(event) {
        await super._onDragStart(event);
    }

    /**configures the standard drag drop event workflow for these item forms to call their relevant functions
     * these functions by default dont actually exist here, only the _onDrop() one exists normally
     * @param {DragEvent} event the event where the item is dropped by
     * @returns 
     */
    async _onDrop(event) {
        await super._onDrop(event);
        const data = {
            files: event.dataTransfer.files,
            items: event.dataTransfer.items,
            types: event.dataTransfer.types,
            object: JSON.parse(event.dataTransfer.getData(`text/plain`))
        }
        LOGGER.debug(`ITEM | DRAG | DROP`, data);

        switch (data.object.type) {
            case "ActiveEffect":
                return this._onDropActiveEffect(event, data);
            case "Item":
                return this._onDropItem(event, data);
            case "Folder":
                return this._onDropFolder(event, data);
            case "Actor":
                return this._onDropActor(event, data);
            default:
                LOGGER.debug(`Recieved unregistered drop type`);
                break;
        }
    }

    /**
     * @override
     * Tells the application that when its closing it should trigger its submit event, and then actually close
     * @param {*} options 
     */
    close(options) {
        this.submit(options);
        super.close(options);
    }

    /**
     * Called when the submit() function is triggered 
     * makes the feature data object, and maps it back to the parent object
     * @param {SubmitEvent} event 
     * @param {Formdata} formdata 
     */
    _updateObject(event, formdata) {
        //Copies the original features array, then sends an updated version back to the object
        //Not sure if theres any way to specifically single out and udpate individual array values yet
        this.label = formdata.label;
        var array = this.item.system.features;
        var found = false;
        var feature = {
            label: formdata.label,
            type: this.type,
            data: this.data,
            id: this.linkID
        };

        //double checks that there is a data array here
        if (Array.isArray(array) && array.length > 0) {
            //checks the array to see if this object exists already to update
            for (var a = 0; a < array.length; a++) {
                if (array[a].id === this.linkID) {
                    found = true;
                    array[a] = feature;
                }
            }
        }
        //if this feature doesnt already exist, add it to the list
        if (!found) array.push(feature);
        //send the updated feature list back to the parent object
        this.item.update({ "system.features": array })
    }
}