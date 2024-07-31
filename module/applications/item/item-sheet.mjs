import LOGGER from "../../helpers/logger.mjs";
import { NewedoSheetMixin } from "../base-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class NewedoItemSheet extends NewedoSheetMixin(foundry.applications.sheets.ItemSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ['item'],
        position: {height: 360, width: 520, top: 100, left: 200},
        actions: {

        }
    }

    static PARTS = {
        body: { template: "systems/newedo/templates/item/body.hbs" },
        header: { template: "systems/newedo/templates/item/header.hbs" }
    }

    static TABS = {
        description: { id: "description", group: "primary", label: "NEWEDO.tab.description" },
        settings: { id: "settings", group: "primary", label: "NEWEDO.tab.settings" },
        rules: { id: "rules", group: "primary", label: "NEWEDO.tab.rules" }
    }

    tabGroups = {
        
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
    async getData() {
        const context = await super.getData();
        const item = context.item;
        const source = item.toObject();

        context.theme = "light";
        if (game.settings.get(game.system.id, "darkmode")) context.theme = "dark";

        foundry.utils.mergeObject(context, {
            source: source.system,
            system: item.system,
            rollData: this.item.getRollData(),
            editable: this.isEditable,
        });

        // Use a safe clone of the item data for further operations.
        const itemData = context.item.toObject();

        // Retrieve the roll data for TinyMCE editors.
        let actor = this.object.parent ?? null;
        if (actor) context.rollData = actor.getRollData();

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = itemData.system;
        context.flags = itemData.flags;

        //HTML enrichment areas for editing text on items
        const enrichmentOptions = {
            secrets: item.isOwner,
            async: true,
            relativeTo: this.item,
            rollData: context.rollData,
        };

        context.itemDescriptionHTML = await TextEditor.enrichHTML(
            context.system.description,
            enrichmentOptions
        );

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        html.find(".skill-dice").each((i, li) => {
            let handler = (ev) => this.item._cycleSkillDice(ev);
            li.addEventListener("click", handler);
            li.addEventListener("contextmenu", handler);
        });

        // ---------------------------------------- FEATURE EDITING -------------------------------------------------------
        html.find(".feature-edit").each((i, li) => {
            // Sets function to open up the 
            let handler = (ev) => _featureOpen(ev, this.item);
            li.addEventListener("click", handler);
        });

        //Delete button for the given feature
        html.find(".feature-delete").each((i, li) => {
            let handler = (ev) => this.item._featureDelete(ev);
            li.addEventListener("click", handler);
        });
    }
}