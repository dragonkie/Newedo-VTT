import NewedoItemSheet from "../item-sheet.mjs";

export default class ItemWeaponSheet extends NewedoItemSheet {
    static DEFAULT_OPTIONS = {
        classes: ['item'],
        position: { height: 360, width: 520, top: 100, left: 200 },
    }

    static PARTS = {
        body: { template: "systems/newedo/templates/item/body.hbs" },
        header: { template: "systems/newedo/templates/item/header.hbs" },
        settings: { template: "systems/newedo/templates/item/weapon-settings.hbs" },
        rules: { template: "systems/newedo/templates/item/rules.hbs" }
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
        context.isEquipped = context.system.equipped;
        context.isRanged = context.system.ranged;
        return context;
    }
}