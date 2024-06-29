import LOGGER from "../../system/logger.mjs";
import sysUtil from "../../system/sysUtil.mjs";
import FeatureConfig from "./feature.mjs";

/**
 * Gives a number of selected items from this feature to the parent actor
 */
export default class ItemChoiceConfig extends FeatureConfig {
    constructor(feature, options={}) {
        super(feature, options);

        this.item = feature.item;
        this._itemList = [];
        
        if (!options.id) this.linkId = randomID();
    }

    get items(){
        return this._itemList;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["newedo", "item-grant-config", "dialog"],
            template: "systems/newedo/templates/dialog/feature/grant-item-config.hbs",
            width: 400,
            height: 400,
            submitOnChange: true,
            closeOnSubmit: false,
            dropKeyPath: null,
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    async getData() {
        const context = {};
        context.items = this.items;
        context.title = this.title;

        context.theme = "light";
        if (game.settings.get(game.system.id, "darkmode")) context.theme = "dark";
        
        return context;
    }

    async _onDragStart(event) {
        await super._onDragStart(event);
        const data = {
            event: event,
            files: event.dataTransfer.files,
            items: event.dataTransfer.items,
            types: event.dataTransfer.types,
            data: sysUtil.parseDrop(event)
        }
        LOGGER.debug(`ITEM | DRAG | START`, data);
    }

    async _onDrop(event) {
        await super._onDrop(event);
        const data = {
          files: event.dataTransfer.files,
          items: event.dataTransfer.items,
          types: event.dataTransfer.types,
          object: sysUtil.parseDrop(event)
        }
        LOGGER.debug(`ITEM | DRAG | DROP`, data);
    
        switch ( data.object.type ) {
        case "ActiveEffect":
            return this._onDropActiveEffect(event, data);
        case "Item":
            return this._onDropItem(event, data);
        case "Folder":
            return this._onDropFolder(event, data);
        default:
            LOGGER.debug(`Recieved unregistered drop type`);
            break;
        }
    }

    async _onDropActiveEffect(event, data) {
        LOGGER.debug(`Active Effect Dropped`, data);
    }

    async _onDropFolder(event, data) {
        LOGGER.debug(`Folder Dropped`, data);
    }

    async _onDropItem(event, data) {
        LOGGER.debug(`Item Dropped`, data);
        const item = await fromUuid(data.object.uuid);
        if ( item ) {
            this._itemList.push({
                object: item, 
                name: item.name, 
                uuid: item.uuid, 
                link: await TextEditor.enrichHTML(`@UUID[${item.uuid}]`)});
            LOGGER.debug(`Item added to list`, this.items)
        }
        this.render(false);
        this.submit();
    }

    close(options) {
        this.submit(options);
        super.close(options);
    }

    /**
     * Calls submits this data to the parent item that will hold this feature
     * @param {SubmitEvent} event 
     * @param {Formdata} formdata 
     */
    _updateObject(event, formdata) {
        LOGGER.debug(`Updating object`);
        LOGGER.debug(`Event:`, event);
        LOGGER.debug(`Formdata:`, formdata);

        const data = {};
        data.form = formdata;
        data.event = event;
        data.items = this.items;
        data.id = this.linkId;
    }
}