/**
 * Class of methods for simplifying debugging, diffrent game setting flags can be toggled to allow certain messages to pop up through the logger
 * Code refrenced and adapted from the CP-R foundry system
 */
export default class LOGGER {
    /**
     * Logger called to send message to console, all messages are marked as from NEWEDO 
     * @param {String} message Text to output, will be marked as from the game system in console
     * @param {*} value optional param that can contain and output objects, methods, etc
     */
    static log(msg, ...value) {
        if (typeof value !== undefined) console.log(`NEWEDO LOG | ${msg}`, ...value);
        else console.log(`NEWEDO LOG | ${msg}`);
    }
    static warn(msg, ...value) {
        if (typeof value !== undefined) console.warn(`NEWEDO WRN | ${msg}`, ...value);
        else console.warn(`NEWEDO WRN | ${msg}`);
    }
    static error(msg, ...value) {
        if (typeof value !== undefined) console.error(`NEWEDO ERR | ${msg}`, ...value);
        else console.error(`NEWEDO ERR | ${msg}`);
    }
    static trace(msg, ...value) {
        console.groupCollapsed(`NEWEDO TRC | ${msg}`);
        if (typeof value !== undefined) console.log(...value);
        console.groupEnd();
    }
    /**
     * Logger called to send message to console, all messages are marked as from NEWEDO 
     * @param {String} message Text to output, will be marked as from the game system in console
     * @param {*} value optional param that can contain and output objects, methods, etc
     */
    static debug(msg = ``, value = ``) {
        if (!game.settings.get(game.system.id, "debugLogs")) return;
        console.log(`NEWEDO DBG | ${msg}`, value);
    }

    static group(msg = '') {
        if (!game.settings.get(game.system.id, "debugLogs")) return;
        console.groupCollapsed('NEWEDO | ' + msg);
    }

    static groupEnd() {
        if (!game.settings.get(game.system.id, "debugLogs")) return;
        console.groupEnd();
    }
}