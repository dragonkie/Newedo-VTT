//imported objects
import { NEWEDO } from "./config.mjs";
import LOGGER from "./helpers/logger.mjs";
import sysUtil from "./helpers/sysUtil.mjs";

import * as applications from "./applications/_module.mjs";
import * as documents from "./documents/_module.mjs";

import NewedoItemSheet from "./applications/item/item-sheet.mjs";

import { actorConstructor, itemConstructor } from "./documents/proxy-manager.js";
import { Dice, NewedoRoll } from "./helpers/dice.mjs";

//imported functions
import preloadHandlebarsTemplates from "./helpers/preload-templates.mjs";

//system settings
import registerSystemSettings from "./helpers/settings.mjs";

LOGGER.log('Loading Newedo.mjs...')

globalThis.newedo = {
    applications: applications,
    documents: documents.documentClasses,
    dataModels: documents.dataModels,
    CONFIG: NEWEDO,
    util: sysUtil
}

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once('init', async function () {
    console.log(`----> 🌸 WELCOME TO NEWEDO SAMURAI 🌸<----`);

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

    Actors.registerSheet("newedo", applications.CharacterSheet, {
        makeDefault: true,
        label: "NEWEDO.ActorSheet.character",
        types: ['character']
    });
    Actors.registerSheet("newedo", applications.NpcSheet, {
        makeDefault: true,
        label: "NEWEDO.ActorSheet.npc",
        types: ['npc']
    });
    Actors.registerSheet("newedo", applications.CharacterSheet, {
        makeDefault: true,
        label: "NEWEDO.ActorSheet.pet",
        types: ['pet']
    });
    Actors.registerSheet("newedo", applications.CharacterSheet, {
        makeDefault: true,
        label: "NEWEDO.ActorSheet.vehicle",
        types: ['vehicle']
    });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("newedo", applications.NewedoItemSheet, {
        makeDefault: true,
        label: "NEWEDO.ItemSheet.item"
    });

    //register the system specific settings
    registerSystemSettings();

    // Preload Handlebars templates.
    return LOGGER.log("Loading templates", preloadHandlebarsTemplates());
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */
Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
        if (typeof arguments[arg] != 'object') {
            outStr += arguments[arg];
        }
    }
    return outStr;
});

Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
});

Handlebars.registerHelper('divide', (a, b) => a / b);
Handlebars.registerHelper('multiply', (a, b) => a * b);
Handlebars.registerHelper('addition', (a, b) => a + b);
Handlebars.registerHelper('subtraction', (a, b) => a - b);
Handlebars.registerHelper('percent', (a, b) => a / b * 100);
Handlebars.registerHelper('disabled', (a) => a == true ? 'disabled' : '');

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
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