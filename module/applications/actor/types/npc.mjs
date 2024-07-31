import NewedoActorSheet from "../actor-sheet.mjs";

export default class NpcSheet extends NewedoActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["npc"],
        position: { height: 600, width: 700, top: 100, left: 200 }
    }

    static PARTS = {
        body: { template: "systems/newedo/templates/actor/npc/body.hbs" },
    }

    static TABS = {
        traits: { id: "traits", group: "primary", label: "NEWEDO.tab.traits" },
        equipment: { id: "equipment", group: "primary", label: "NEWEDO.tab.equipment" },
        augments: { id: "augments", group: "primary", label: "NEWEDO.tab.augs" },
        magic: { id: "magic", group: "primary", label: "NEWEDO.tab.magic" },
        description: { id: "description", group: "primary", label: "NEWEDO.tab.bio" }
    }

    tabGroups = {
        primary: "traits"
    }
}