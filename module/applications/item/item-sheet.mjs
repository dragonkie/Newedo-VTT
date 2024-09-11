import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { NewedoSheetMixin } from "../base-sheet.mjs";

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
    async _prepareContext() {
        const context = await super._prepareContext();

        // Creates custom skill list from owning actors skills if available, otherwise uses the default list
        context.skills = [];
        context.selectSkills = '';
        if (this.document.actor != null) {
            // create the list of skills
            for (const skill of this.document.actor.itemTypes.skill) {
                context.skills.push({
                    label: skill.name,
                    trait: skill.system.trait,
                    group: 'NEWEDO.trait.core.' + skill.system.trait,
                    value: skill.system.slug
                })
            }

            context.selectSkills = foundry.applications.fields.createSelectInput({
                options: context.skills,
                value: this.document.system.skill,
                valueAttr: "value",
                labelAttr: "label",
                localize: true,
                sort: true,
                name: 'system.skill'
            }).outerHTML

        } else {
            context.selectSkills = newedo.element.select.Skills(this.document.system.skill, 'system.skill')
        }

        context.settings = await renderTemplate(`systems/newedo/templates/item/settings/${this.document.type}.hbs`, context);
        const enrichmentOptions = {
            secrets: this.document.isOwner,
            async: true,
            rollData: context.rollData
        };

        context.richDescription = await TextEditor.enrichHTML(context.system.description, enrichmentOptions);

        return context;
    }
}