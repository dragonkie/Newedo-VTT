import LOGGER from "../utility/logger.mjs";

export default function registerSystemSettings() {
    LOGGER.log(`Registering system settings`);
    //toggles the debug log visiblity in the console
    game.settings.register(game.system.id, "debugLogs", {
        name: "toggle debug logs",
        hint: "Numeric value from 0-10, specifies diffrent debug scopes, 0 is off, 1 shows main functions, 2 shows internal function calls, etc",
        scope: "client",
        config: true,
        type: Number,
        default: false,
        onChange: (value) => {
            LOGGER.log(`Changed debugLog to ${value}`);
        }
    });
    //toggles between light and dark mode sheets
    game.settings.register(game.system.id, "darkmode", {
        name: "Darkmode",
        hint: "when toggled, sheets will render out using dark mode styles",
        scope: "client",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            LOGGER.log(`Changed darkmode to ${value}`);
        }
    });
};