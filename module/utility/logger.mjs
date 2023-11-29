/**
 * Class of methods for simplifying debugging, diffrent game setting flags can be toggled to allow certain messages to pop up through the logger
 * Code refrenced and adapted from the CP-R foundry system
 */
export default class LOGGER {
    /**
     * Logger called to send message to console, all messages are marked as from NEWEDO 
     * @param {msg} message Text to output, will be marked as from the game system in console
     * @param {value} value optional param that can contain and output objects, methods, etc
     */
    static log (msg, value) {
        if (typeof value !== `undefined`) console.log(`NEWEDO | ${msg}`, value);
        else console.log(`NEWEDO | ${msg}`);
    }

    /**
     * Logger called to send message to console, all messages are marked as from NEWEDO 
     * @param {msg} message Text to output, will be marked as from the game system in console
     * @param {value} value optional param that can contain and output objects, methods, etc
     */
    static debug(msg=``, value) {
        if (game.settings.get(game.system.id, "debugLogs")) {
            if (typeof value !== `undefined`) console.debug(`NEWEDO DBG | ${msg}`, value);
            else console.debug(`NEWEDO DBG | ${msg}`);
        }
    }
}