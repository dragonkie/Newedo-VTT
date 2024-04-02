import FeatureCreate from "../../apps/feature/feature-create.js";
import FeatureItemConfig from "../../apps/feature/feature-item.js";
import FeatureTraitConfig from "../../apps/feature/feature-trait.js";
import LOGGER from "../../utility/logger.mjs";
import sysUtil from "../../utility/sysUtil.mjs";
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class NewedoItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["newedo", "sheet", "item"],
            width: 520,
            height: 360,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "description",
                },
            ],
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
        const data = {
            files: event.dataTransfer.files,
            items: event.dataTransfer.items,
            types: event.dataTransfer.types,
            object: JSON.parse(event.dataTransfer.getData(`text/plain`)),
        };
        LOGGER.debug(`ITEM | DRAG | DROP`, data);

        switch (data.object.type) {
            case "ActiveEffect":
                return this._onDropActiveEffect(event, data);
            case "Actor":
                return this._onDropActor(event, data);
            case "Item":
                return this._onDropItem(event, data);
            case "Folder":
                return this._onDropFolder(event, data);
        }
    }

    async _onDropActor(event, data) {
        LOGGER.debug(`Actor Dropped`);
    }

    async _onDropActiveEffect(event, data) {
        LOGGER.debug(`Active Effect Dropped`);
    }

    async _onDropFolder(event, data) {
        LOGGER.debug(`Folder Dropped`);
    }

    /** @override */
    get template() {
        const path = `systems/${game.system.id}/templates/item`;
        // Return a single sheet for all item types.
        // return `${path}/item-sheet.html`;

        // Alternatively, you could use the following return statement to do a
        // unique item sheet by type, like `item-weapon-sheet.html`.
        return `${path}/item-${this.item.type}-sheet.hbs`;
    }

    /* -------------------------------------------- */

    /** @override */
    async getData() {
        // Retrieve base data structure.
        const context = await super.getData();
        const item = context.item;
        const source = item.toObject();

        context.theme = "light";
        if (game.settings.get(game.system.id, "darkmode")) context.theme = "dark";

        foundry.utils.mergeObject(context, {
            source: source.system,
            system: item.system,
            rollData: this.item.getRollData(),
        });

        // Use a safe clone of the item data for further operations.
        const itemData = context.item;

        // Retrieve the roll data for TinyMCE editors.
        let actor = this.object.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

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
            let handler = (ev) => this._cycleSkillDice(ev);
            li.addEventListener("click", handler);
        });

        // ---------------------------------------- FEATURE EDITING -------------------------------------------------------
        html.find(".feature-edit").each((i, li) => {
            // Sets function to open up the 
            let handler = (ev) => _featureOpen(ev, this.item);
            li.addEventListener("click", handler);
        });

        html.find(".feature-create").each((i, li) => {
            let handler = (ev) => new FeatureCreate({item: this.item}).render(true);
            li.addEventListener("click", handler);
        });

        html.find(".feature-delete").each((i, li) => {
            let handler = (ev) => this.item._featureDelete(ev);
            li.addEventListener("click", handler);
        });
        
    }

    async _cycleSkillDice(_click) {
        _click.preventDefault();

        const _index = _click.target.attributes.index.value;
        const itemData = this.item;
        let system = itemData.system;
        let ranks = system.ranks;

        switch (ranks[_index]) {
            case 0:
                ranks[_index] = 4;
                break;
            case 4:
                ranks[_index] = 6;
                break;
            case 6:
                ranks[_index] = 8;
                break;
            case 8:
                ranks[_index] = 12;
                break;
            default:
                ranks[_index] = 0;
                break;
        }

        await this.item.update({ [`system.ranks`]: ranks });
    }
}

async function _featureOpen(event, item) {
    LOGGER.debug(`event`, event);
    LOGGER.debug(`item`, item);
    if (!item) LOGGER.debug(`Cant open a feature without the item its linked too`);
    const element = event.target.closest(".feature");
    const id = element.dataset.featureId;
    const features = item.system.features;
    
    for (var a = 0; a < features.length; a++) {
        if (features[a].id === id) {
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