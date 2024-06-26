import FeatureCreate from "../apps/feature/feature-create.mjs";
import FeatureItemConfig from "../apps/feature/feature-item.mjs";
import FeatureTraitConfig from "../apps/feature/feature-trait.mjs";
import LOGGER from "../system/logger.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class NewedoItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["newedo", "sheet", "item"],
            width: 520,
            height: 360,
            tabs: [{
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "description",
            }],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
        });
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

        //Handels feature creation
        html.find(".feature-create").each((i, li) => {
            let handler = (ev) => new FeatureCreate({ item: this.item }).render(true);
            li.addEventListener("click", handler);
        });
        //Delete button for the given feature
        html.find(".feature-delete").each((i, li) => {
            let handler = (ev) => this.item._featureDelete(ev);
            li.addEventListener("click", handler);
        });
    }
}

/**
 * Opens up an application window corresponding to the feature type
 * @param {Event} event 
 * @param {NewedoItem} item 
 * @returns 
 */
async function _featureOpen(event, item) {
    LOGGER.debug(`event`, event);
    LOGGER.debug(`item`, item);
    if (!item) LOGGER.debug(`Cant open a feature without the item its linked too`);
    const element = event.target.closest(".feature");
    const id = element.dataset.featureId;
    const features = item.system.features;

    for (var a = 0; a < features.length; a++) {
        if (features[a].id === id) {
            //Prepares the data object iwth everything we need to load the feature
            const target = features[a];
            const feature = {}
            feature.item = item;
            feature.data = target.data;
            feature.id = target.id;
            feature.label = target.label;

            switch (target.type) {
                case "item":
                    return new FeatureItemConfig(feature).render(true);
                case "trait":
                    return new FeatureTraitConfig(feature).render(true);
                default:
                    LOGGER.debug(`Unregistered feature handeler`);
                    break;
            }
        }
    }
}