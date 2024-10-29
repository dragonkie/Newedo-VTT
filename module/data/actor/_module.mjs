import CharacterDataModel from "./character.mjs";
import NpcDataModel from "./npc.mjs";
import PetDataModel from "./pet.mjs";
import VehicleDataModel from "./vehicle.mjs";

export {
    CharacterDataModel,
    NpcDataModel,
    PetDataModel,
    VehicleDataModel
};

export const config = {
    character: CharacterDataModel,
    npc: NpcDataModel,
    pet: PetDataModel,
    vehicle: VehicleDataModel
}