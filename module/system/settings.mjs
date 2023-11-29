import NEWEDO from "./config.mjs";
import LOGGER from "../utility/logger.mjs";

const registerSystemSettings = () => {
    LOGGER.log(`Registering system settings`);
    
    game.settings.register(game.system.id, "debugLogs", {
        name: "toggle debug logs",
        hint: "when true, debug logs will be visible in the console",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            LOGGER.log(`Changed debugLog to ${value}`);
        }
    });
};

export default registerSystemSettings;