//import configuration
import { NEWEDO } from "./config.mjs";
import registerSystemSettings from "./helpers/settings.mjs";
import registerHooks from "./helpers/hooks/_module.mjs";

// Import helpers
import LOGGER from "./helpers/logger.mjs";
import sysUtil from "./helpers/sysUtil.mjs";
import preloadHandlebarsTemplates from "./helpers/preload-templates.mjs";
import { elements } from "./elements/_module.mjs";

// Import submodules
import { applications } from "./applications/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as dataModels from "./data/_module.mjs"
import registerHelpers from "./helpers/registerHelpers.mjs";

LOGGER.log('Loading Newedo.mjs...')

globalThis.newedo = {
    applications,
    documents: documents,
    dataModels: dataModels,
    CONFIG: NEWEDO,
    util: sysUtil,
    elements,
}

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once('init', async function () {
    console.log(`----> 🌸 WELCOME TO NEWEDO SAMURAI 🌸<----`);

    // Add custom constants for configuration.
    CONFIG.NEWEDO = NEWEDO;
    CONFIG.Combat.initiative = { formula: "@traits.derived.init.value", decimals: 0 };

    // Prepare document classes
    CONFIG.Actor.documentClass = documents.NewedoActor;
    CONFIG.Item.documentClass = documents.NewedoItem;

    // Link up system data models
    CONFIG.Actor.dataModels = dataModels.actor.config;
    CONFIG.Item.dataModels = dataModels.item.config;

    //register the system specific settings
    registerSystemSettings();

    // Prepare handlebars tempaltes
    preloadHandlebarsTemplates();

    /* -------------------------------------------- */
    /*  Register Document Sheets                    */
    /* -------------------------------------------- */
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    for (const sheet of applications.sheets.actor.config) {
        Actors.registerSheet("newedo", sheet.application, sheet.options);
    }

    Items.registerSheet("newedo", applications.sheets.item.NewedoItemSheet, {
        makeDefault: true,
        label: "NEWEDO.ItemSheet.item"
    });

    Items.registerSheet("newedo", applications.sheets.item.SkillSheet, {
        makeDefault: true,
        label: "NEWEDO.ItemSheet.skill",
        types: ['skill']
    });

    Items.registerSheet("newedo", applications.sheets.item.WeaponSheet, {
        makeDefault: true,
        label: "NEWEDO.ItemSheet.weapon",
        types: ['weapon']
    });

    Items.registerSheet("newedo", applications.sheets.item.RoteSheet, {
        makeDefault: true,
        label: "NEWEDO.ItemSheet.rote",
        types: ['rote']
    });
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
registerHooks();

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */
registerHelpers();

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