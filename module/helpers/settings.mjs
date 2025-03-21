import LOGGER from "./logger.mjs";

export default function registerSystemSettings() {
    LOGGER.log(`Registering system settings`);
    // Toggles the debug log visiblity in the console
    game.settings.register(game.system.id, "debugLogs", {
        name: "Debug Logs", // displayed name of the setting
        hint: "Enables debug logs in the console",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            LOGGER.log(`SETTING | debugLog set to ${value}`);
        }
    });

    // Toggles if npcs should be able to use detailed skill ranks
    game.settings.register(game.system.id, "npcSkillRanks", {
        name: "NPC skill ranks",
        hint: "Enables NPC using skill ranks instead of a skill level",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            LOGGER.log(`SETTING | npcSkillRanks set to ${value}`);
        }
    });

    // NPC critical hits, allowed once per round, reseting
    game.settings.register(game.system.id, "npcCritical", {
        name: "NPC critical hits",
        hint: "Adds a 5% chance for NPC actions to crit while still lacking fate cards",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            LOGGER.log(`SETTING | npcCritical set to ${value}`);
        }
    });

    
};