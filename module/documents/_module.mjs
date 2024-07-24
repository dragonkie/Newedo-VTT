// Base Documents
import NewedoActor from "./actor/actor.mjs";
import NewedoItem from "./item/item.mjs";

// Actor Types
import NewedoCharacter from "./actor/types/character.mjs";
import NewedoNPC from "./actor/types/npc.mjs";
import NewedoPet from "./actor/types/pet.mjs";
import NewedoVehicle from "./actor/types/vehicle.mjs";

// Item Types
import NewedoAmmo from "./item/types/ammo.mjs"
import NewedoArmour from "./item/types/armour.mjs";
import NewedoAugment from "./item/types/augment.mjs";
import NewedoCulture from "./item/types/culture.mjs";
import NewedoFate from "./item/types/fate.mjs";
import NewedoKami from "./item/types/kami.mjs";
import NewedoLineage from "./item/types/lineage.mjs";
import NewedoRote from "./item/types/rote.mjs";
import NewedoSkill from "./item/types/skill.mjs";
import NewedoWeapon from "./item/types/weapon.mjs";

export const dataModels = {
    actor: {
        character: NewedoCharacter,
        npc: NewedoNPC,
        pet: NewedoPet,
        vehicle: NewedoVehicle
    },
    item: {
        ammo: NewedoAmmo,
        armour: NewedoArmour,
        augment: NewedoAugment,
        culture: NewedoCulture,
        fate: NewedoFate,
        kami: NewedoKami,
        lineage: NewedoLineage,
        rote: NewedoRote,
        skill: NewedoSkill,
        weapon: NewedoWeapon
    }
}

export const documentClasses = {
    actor: NewedoActor,
    item: NewedoItem
}