// Base classes
import NewedoActor from "./actor/actor.mjs";
import NewedoItem from "./item/item.mjs";

// Actor Types
import NewedoCharacter from "./actor/types/character.mjs";
import NewedoNPC from "./actor/types/npc.mjs";
import NewedoPet from "./actor/types/pet.mjs";
import NewedoVehicle from "./actor/types/vehicle.mjs";

// Item Types
import NewedoAmmo from "./item/types/ammo.mjs";
import NewedoArmour from "./item/types/armour.mjs";
import NewedoAugment from "./item/types/augment.mjs";
import NewedoCulture from "./item/types/culture.mjs";
import NewedoFate from "./item/types/fate.mjs";
import NewedoKami from "./item/types/kami.mjs";
import NewedoLineage from "./item/types/lineage.mjs";
import NewedoRote from "./item/types/rote.mjs";
import NewedoSkill from "./item/types/skill.mjs"
import NewedoWeapon from "./item/types/weapon.mjs";

//This code has been shamelessly stolen from the Cyberpunk red system
//Bless your souls for making well documented code to learn from

/**
 * Wraps all actors and items in a proxy that will intercept their constructor
 * Allows for orginization of type specific functions into seperate classes and files
 * @param {Object} entityTypes the list of classes that can be accesed by an entities data.type string
 * @param {Class} baseClass the object type being wrapped in the proxy and having its constructor intercepted
 * @returns 
 */
function mapProxies(entityTypes, baseClass) {
  // Adds a proxy to trap the item and actor classes
  return new Proxy(baseClass, {
    // Construct trap
    construct: (target, args) => {
      const [data, options] = args;// Args is an array holding the entity data and its creation options
      //Data is the standard NewedoActor or NewedoItem being created, and the .type is embedded in them at this point already
      const constructor = entityTypes[data.type];//Grabs the item type from the supplied list based on the entity type string

      if (!constructor)//if the constructor was not found, throw an error
        throw new Error(`Unsupported Entity type for create(): ${data.type}`);
      return new constructor(data, options);//Run the new types constructor on this object in place of the default one
    }
  });
}

// Type lists, names of properties MUST match the in game types
const actorTypes = {};
actorTypes.character = NewedoCharacter;
actorTypes.npc = NewedoNPC;
actorTypes.pet = NewedoPet;
actorTypes.vehicle = NewedoVehicle;

const itemTypes = {};
itemTypes.ammo = NewedoAmmo;
itemTypes.armour = NewedoArmour;
itemTypes.augment = NewedoAugment;
itemTypes.culture = NewedoCulture;
itemTypes.fate = NewedoFate;
itemTypes.kami = NewedoKami;
itemTypes.lineage = NewedoLineage;
itemTypes.rote = NewedoRote;
itemTypes.skill = NewedoSkill;
itemTypes.weapon = NewedoWeapon;

// Export the compiled type list proxies
export const actorConstructor = mapProxies(actorTypes, NewedoActor);
export const itemConstructor = mapProxies(itemTypes, NewedoItem);