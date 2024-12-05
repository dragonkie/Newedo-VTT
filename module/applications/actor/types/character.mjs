import NewedoActorSheet from "../actor-sheet.mjs";
import sysUtil from "../../../helpers/sysUtil.mjs";
import LOGGER from "../../../helpers/logger.mjs";

export default class CharacterSheet extends NewedoActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["character"],
        position: { height: 680, width: 840, top: 60, left: 125 }
    }

    static PARTS = {
        panel: { template: "systems/newedo/templates/actor/character/panel.hbs" },
        body: { template: "systems/newedo/templates/actor/character/body.hbs" },
        header: { template: "systems/newedo/templates/actor/character/header.hbs" },
        traits: { template: "systems/newedo/templates/actor/character/traits.hbs" },
        skills: { template: "systems/newedo/templates/actor/character/skills.hbs" },
        equipment: { template: "systems/newedo/templates/actor/character/equipment.hbs" },
        magic: { template: "systems/newedo/templates/actor/character/magic.hbs" },
        augments: { template: "systems/newedo/templates/actor/character/augments.hbs" },
        effects: { template: "systems/newedo/templates/actor/effects.hbs"},
        description: { template: "systems/newedo/templates/actor/character/biography.hbs" }
    }

    static TABS = {
        traits: { id: "traits", group: "primary", label: "NEWEDO.tab.traits" },
        skills: { id: "skills", group: "primary", label: "NEWEDO.tab.skills" },
        equipment: { id: "equipment", group: "primary", label: "NEWEDO.tab.equipment" },
        augments: { id: "augments", group: "primary", label: "NEWEDO.tab.augs" },
        magic: { id: "magic", group: "primary", label: "NEWEDO.tab.magic" },
        effects: { id: "effects", group: "primary", label: "NEWEDO.tab.effects"},
        description: { id: "description", group: "primary", label: "NEWEDO.tab.bio" }
    }

    tabGroups = {
        primary: "traits"
    }

    async _prepareContext() {
        const context = await super._prepareContext();
        //constants to hold references to the diffrent trait links
        const { core, derived } = context.system.traits;

        // Localize core traits
        for (let [k, v] of Object.entries(core)) {
            v.label = sysUtil.localize(CONFIG.NEWEDO.trait.core[k]);
            v.abr = sysUtil.localize(CONFIG.NEWEDO.trait.core.abbr[k]);
        }

        // Localize Derived traits.
        for (let [k, v] of Object.entries(derived)) {
            v.label = sysUtil.localize(CONFIG.NEWEDO.trait.derived[k]);
            v.abr = sysUtil.localize(CONFIG.NEWEDO.trait.derived.abbr[k]);
        }

        // Localize armour labels
        for (let [k, v] of Object.entries(context.system.armour)) {
            v.label = sysUtil.localize(CONFIG.NEWEDO.damage[k]);
            v.abr = sysUtil.localize(CONFIG.NEWEDO.damage.abbr[k]);
        }

        // Localize Backgrounds
        for (let [k, v] of Object.entries(context.system.background)) {
            v.label = sysUtil.localize(CONFIG.NEWEDO.background[k]);
        }

        context.lineage = this.document.itemTypes.lineage[0];
        context.culture = this.document.itemTypes.culture[0];

        LOGGER.debug('SHEET | CHARACTER | PREPARE CONTEXT', context);
        return context;
    }
}