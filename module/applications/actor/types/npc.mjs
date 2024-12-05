import NewedoActorSheet from "../actor-sheet.mjs";
import sysUtil from "../../../helpers/sysUtil.mjs";

export default class NpcSheet extends NewedoActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["npc"],
        position: { height: 600, width: 700, top: 100, left: 200 }
    }

    static PARTS = {
        panel: { template: "systems/newedo/templates/actor/npc/panel.hbs" },
        body: { template: "systems/newedo/templates/actor/npc/body.hbs" },
        header: { template: "systems/newedo/templates/actor/character/header.hbs" },
        traits: { template: "systems/newedo/templates/actor/npc/traits.hbs" },
        equipment: { template: "systems/newedo/templates/actor/npc/equipment.hbs" },
        magic: { template: "systems/newedo/templates/actor/npc/magic.hbs" },
        augments: { template: "systems/newedo/templates/actor/npc/augments.hbs" }
    }

    static TABS = {
        traits: { id: "traits", group: "primary", label: "NEWEDO.tab.traits" },
        equipment: { id: "equipment", group: "primary", label: "NEWEDO.tab.equipment" },
        augments: { id: "augments", group: "primary", label: "NEWEDO.tab.augs" },
        magic: { id: "magic", group: "primary", label: "NEWEDO.tab.magic" },
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

        return context;
    }
}    