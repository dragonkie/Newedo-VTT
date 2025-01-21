import NewedoItemSheet from "../item.mjs";

export default class FateSheet extends NewedoItemSheet {
    static DEFAULT_OPTIONS = {

    }

    static PARTS = {
        header: { template: "systems/newedo/templates/item/header.hbs" },
        tabs: { template: "systems/newedo/templates/shared/tabs-nav.hbs" },
        body: { template: "systems/newedo/templates/item/body.hbs" },
        rules: { template: "systems/newedo/templates/item/rules.hbs" },
        description: { template: "systems/newedo/templates/item/description.hbs" },
        settings: { template: "systems/newedo/templates/item/settings/fate.hbs" }
    }

    static TABS = {
        description: { id: "description", group: "primary", label: "NEWEDO.tab.description" },
        settings: { id: "settings", group: "primary", label: "NEWEDO.tab.settings" },
        rules: { id: "rules", group: "primary", label: "NEWEDO.tab.rules" }
    }

    tabGroups = {
        primary: "description"
    }

    async _prepareContext() {
        const context = await super._prepareContext();

        return context;
    }
}