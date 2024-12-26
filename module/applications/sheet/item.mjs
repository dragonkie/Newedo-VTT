import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import NewedoSheetMixin from "./mixin.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class NewedoItemSheet extends NewedoSheetMixin(foundry.applications.sheets.ItemSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ['item'],
        position: { height: 360, width: 520, top: 100, left: 200 },
    }

    static PARTS = {
        header: { template: "systems/newedo/templates/item/header.hbs" },
        tabs: { template: "systems/newedo/templates/shared/tabs-nav.hbs" },
        body: { template: "systems/newedo/templates/item/body.hbs" },
        rules: { template: "systems/newedo/templates/item/rules.hbs" },
        description: { template: "systems/newedo/templates/item/description.hbs" },
        settings: { template: "systems/newedo/templates/item/settings.hbs" }
    }

    static TABS = {
        description: { id: "description", group: "primary", label: "NEWEDO.tab.description" },
        settings: { id: "settings", group: "primary", label: "NEWEDO.tab.settings" },
        rules: { id: "rules", group: "primary", label: "NEWEDO.tab.rules" }
    }

    tabGroups = {
        primary: "description"
    }

    async _onDragStart(event) {
        await super._onDragStart(event);
        const data = {
            event: event,
            files: event.dataTransfer.files,
            items: event.dataTransfer.items,
            types: event.dataTransfer.types,
            data: JSON.parse(event.dataTransfer.getData(`text/plain`)),
        };
        LOGGER.debug(`ITEM | DRAG | START`, data);
    }

    async _onDrop(event) {
        await super._onDrop(event);
        const data = JSON.parse(event.dataTransfer.getData(`text/plain`));
        const item = this.item;

        if (typeof item._onDrop === `function`) item._onDrop(data);
        else LOGGER.warn(`No drop function defined for item type ${item.type}`);
    }

    /** @override */
    get template() {
        const path = `systems/${game.system.id}/templates/item`;
        return `${path}/item-${this.item.type}-sheet.hbs`;
    }

    /* -------------------------------------------- */

    /**
     * @override 
     * Passes the context data used to render the HTML template
    */
    async _prepareContext(partId, content) {
        LOGGER.debug('Prpareing item sheet context')
        const context = await super._prepareContext(partId, content);
        LOGGER.debug('super prepContext', super._prepareContext)

        context.settings = await renderTemplate(`systems/newedo/templates/item/settings/${this.document.type}.hbs`, context);
        
        const enrichmentOptions = {
            rollData: context.rollData
        };

        context.description = {
            field: this.document.system.schema.getField('description'),
            value: this.document.system.description,
            enriched: await TextEditor.enrichHTML(context.system.description, enrichmentOptions),
        }

        return context;
    }
}