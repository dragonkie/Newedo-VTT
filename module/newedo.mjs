//import configuration
import { NEWEDO } from "./config.mjs";
import registerHooks from "./helpers/hooks.mjs";
import registerSystemSettings from "./helpers/settings.mjs";

// Import helpers
import * as helpers from "./helpers/_module.mjs";
import { elements } from "./elements/_module.mjs";
import LOGGER from "./helpers/logger.mjs";

// Import submodules
import * as applications from "./applications/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as dataModels from "./data/_module.mjs"

LOGGER.log('Traveling to NewEdo...')

globalThis.newedo = {
    application: applications,
    document: documents,
    data: dataModels,
    CONFIG: NEWEDO,
    helper: helpers,
    elements,
}

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once('init', async function () {
    LOGGER.log(`----> 🌸 WELCOME TO NEWEDO SAMURAI 🌸<----`);

    // Add custom constants for configuration.
    CONFIG.NEWEDO = NEWEDO;
    newedo.id = game.system.id;

    // Add combat documents
    CONFIG.Combat.documentClass = documents.NewedoCombat;
    CONFIG.Combatant.documentClass = documents.NewedoCombatant;

    // Prepare document classes
    CONFIG.Actor.documentClass = documents.NewedoActor;
    CONFIG.Item.documentClass = documents.NewedoItem;
    
    // Link up system data models
    CONFIG.Actor.dataModels = dataModels.actor.config;
    CONFIG.Item.dataModels = dataModels.item.config;

    //register the system specific settings
    helpers.registerSystemSettings();
    helpers.registerHooks();
    helpers.handlebars.registerTemplates();
    helpers.handlebars.registerHelpers();

    /* -------------------------------------------- */
    /*  Register Document Sheets                    */
    /* -------------------------------------------- */
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // register actor sheets
    for (const sheet of applications.sheet.actor.config) {
        Actors.registerSheet("newedo", sheet.application, sheet.options);
    }

    // register item sheets
    for (const sheet of applications.sheet.item.config) {
        Items.registerSheet("newedo", sheet.application, sheet.options);
    }

    /* -------------------------------------------- */
    /*  Register users global socket                */
    /* -------------------------------------------- */
    newedo.socket = new newedo.helper.NewedoSocketManager();
});