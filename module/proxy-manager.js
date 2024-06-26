// Base classes
import NewedoActor from "./documents/actor/edo-actor.mjs";
import NewedoItem from "./documents/item/edo-item.mjs";

// Actor Types
import NewedoCharacter from "./documents/actor/types/edo-character.js";
import NewedoNPC from "./documents/actor/types/edo-npc.js";
import NewedoPet from "./documents/actor/types/edo-pet.js";
import NewedoVehicle from "./documents/actor/types/edo-vehicle.js";

// Item Types
import NewedoAmmo from "./documents/item/types/edo-ammo.js";
import NewedoArmour from "./documents/item/types/edo-armour.js";
import NewedoAugment from "./documents/item/types/edo-augment.js";
import NewedoCulture from "./documents/item/types/edo-culture.js";
import NewedoFate from "./documents/item/types/edo-fate.js";
import NewedoKami from "./documents/item/types/edo-kami.js";
import NewedoLineage from "./documents/item/types/edo-lineage.js";
import NewedoRote from "./documents/item/types/edo-rote.js";
import NewedoSkill from "./documents/item/types/edo-skill.js"
import NewedoWeapon from "./documents/item/types/edo-weapon.js";

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