import CharacterSheet from "./types/character.mjs";
import NpcSheet from "./types/npc.mjs";
import PetSheet from "./types/pet.mjs";
import VehicleSheet from "./types/vehicle.mjs";

export { default as NewedoActorSheet } from "./actor-sheet.mjs";
export { default as CharacterSheet } from "./types/character.mjs";
export { default as NpcSheet } from "./types/npc.mjs";
export { default as PetSheet } from "./types/pet.mjs";
export { default as VehicleSheet } from "./types/vehicle.mjs";

export const config = [
    {
        application: CharacterSheet,
        options: {
            label: "NEWEDO.ActorSheet.character",
            types: ['character']
        }
    }, {
        application: NpcSheet,
        options: {
            label: "NEWEDO.ActorSheet.npc",
            types: ['npc']
        }
    }, {
        application: PetSheet,
        options: {
            label: "NEWEDO.ActorSheet.pet",
            types: ['pet']
        }
    }, {
        application: VehicleSheet,
        options: {
            label: "NEWEDO.ActorSheet.vehicle",
            types: ['vehicle']
        }
    },
]

