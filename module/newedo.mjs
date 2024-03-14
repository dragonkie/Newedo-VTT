//imported objects
import { NEWEDO } from "./system/config.mjs";
import LOGGER from "./utility/logger.mjs";
import systemUtility from "./utility/systemUtility.mjs";

import NewedoActorSheet from "./actor/sheet/edo-actor-sheet.mjs";
import NewedoItemSheet from "./item/sheet/edo-item-sheet.mjs";

import NewedoActor from "./actor/edo-actor.mjs";
import NewedoItem from "./item/edo-item.mjs";

import { actorConstructor, itemConstructor } from "./proxy-manager.js";

import { Dice, NewedoRoll} from "./utility/dice.js";

//imported functions
import preloadHandlebarsTemplates from "./helpers/preload-templates.mjs";
import registerHooks from "./system/hooks.js";

//system settings
import registerSystemSettings from "./system/settings.mjs";
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once('init', async function() {
  LOGGER.log(`------------------ WELCOME TO NEWEDO SAMURAI ---------------`);
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.newedo = {
    NewedoActor,
    NewedoItem,
    rollItemMacro,
    LOGGER,
    systemUtility,
    Dice,
    NewedoRoll,
  };

  // Add custom constants for configuration.
  CONFIG.NEWEDO = NEWEDO;
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@traits.derived.init.value",
    decimals: 2
  };

  // Define custom Document classes
  LOGGER.log("Setting document classes");
  CONFIG.Actor.documentClass = actorConstructor;
  CONFIG.Item.documentClass = itemConstructor;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("newedo", NewedoActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("newedo", NewedoItemSheet, { makeDefault: true });

  //register the system specific settings
  registerSystemSettings();
  registerHooks();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */
// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

//handelbars functions
//localization function for displaying localized details directly for when they need to be parsed
Handlebars.registerHelper('i18n', function(str) {
  return systemUtility.Localize(str);
});
//adds or removes the exploding dice text from a line
Handlebars.registerHelper(`diceExplode`, function(str, toggle) {
  return systemUtility.diceExplode(str, toggle);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.newedo.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "newedo.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}