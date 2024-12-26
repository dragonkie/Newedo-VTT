import CharacterSheet from "./character.mjs";
import NpcSheet from "./npc.mjs";
import PetSheet from "./pet.mjs";
import VehicleSheet from "./vehicle.mjs";

export { default as CharacterSheet } from "./character.mjs";
export { default as NpcSheet } from "./npc.mjs";
export { default as PetSheet } from "./pet.mjs";
export { default as VehicleSheet } from "./vehicle.mjs";

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

