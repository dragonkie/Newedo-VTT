import LOGGER from "./logger.mjs";

export default class systemUtility {

     /**
   * Localize a string using internationalization.
   * 
   * this format calls the game.i18n.localize(), but is more convinient and easier to understand
   * @param {string} string - The string to localized
   * @returns {string} The localized string
   */
    static Localize(str) {
        return game.i18n.localize(str);
    }

    /**
     * Display notifications (These are sometimes displayed globally, and sometimes not, havent figured that out yet)
     *
     * @param {String} msgType - The type of notification to show
     * @param {String} msg - Text for the notification
     */
    static async DisplayMessage(msgType, msg) {
        switch (msgType) {
            case "warn":
                ui.notifications.warn(msg);
                LOGGER.warn(msg);
                break;
            case "error":
                ui.notifications.error(msg);
                LOGGER.error(msg);
                break;
            case "notify":
                ui.notifications.notify(msg);
                LOGGER.log(msg);
                break;
            default:
        }
    }

    /**
     * Compiles a string of dice from a given array of numeric entries
     * @param {*} arr array of values passed into the function to be sorted into a string
     */
    static dicetray ( arr ) {
        let diceList = [];
        let formula = ``;

        for (const r of arr) {
            //catches empty values and prevents them from adding to the pool
            if (r <= 0) continue;
            //converts the value into a dice string
            const dice = `d${r}`;
            //checks to ensure the dicetray is an array and if it has a value
            if (Array.isArray(diceList) && diceList.length > 0) {
                //loops through the dice tray to check if the given dice is already found in the pool
                var found = false;
                for (const d of diceList) {
                    //if the dice is found, adds to its pile then exits the loop
                    if (d.dice == dice) {
                        found = true;
                        d.count += 1;
                        break;
                    }
                }
                //if no dice exist in the pool, or this type of dice isnt there, add the new dice to the array
                if (!found) diceList.push({dice: dice, count: 1});
            } else diceList.push({dice: dice, count: 1});
        }

        //var to make sure that unneccesary `+` signs arent added at the start of the line
        var first = true;
        //catches if the core trait has already been added to formula, which will mean it needs to add the `+`
        if (formula !== ``) first = false;
        //loops through the pool of dice and adds them in to the stringified formula
        for (const d of diceList) {
            if (!first) formula += `+`;
            formula += `${d.count}${d.dice}`;
            first = false;
        }
        return formula;
    }
    
    /**
     * Searches through the given array of objects, and gathers a list of entries together that have a matching key / value pair
     *
     * @param {Array | Object} list either a list of objects, or an object itself
     * @param {String} key Path to the variable in dot notation eg system.skills.sword
     * @param {any} value the value to search the object for
     */
    static getObjectList(list, key, value) {
        var newList = [];
        var path = key.split(`.`);

        if (Array.isArray(list)) {
            //if an array of objects was entered
            for (let a=0; a<list.length; a++) {
                //loops through the passed array
                for (let [k, v] of Object.entries(list[a])) {
                    //check each object of the array
                    var objRef = v;
                    for (let b=0; b<path.length; b++) {
                        //goes through the diffrent steps of the path
                        objRef = objRef[path[b]];
                    }

                    if (objRef === value) newList.push(v);
                }
            }

        }
        else if (typeof list === `object`) {

            for (let [k, v] of Object.entries(list)) {
                var objRef = v;
                    for (let b=0; b<path.length; b++) {
                        //goes through the diffrent steps of the path
                        objRef = objRef[path[b]];
                    }

                    if (objRef === value) newList.push(v);
            }

        }
        else {
            LOGGER.error(`Invalid entry of type ${typeof list} passed to getObjectList();`);
        }
        return newList;
    }

    /**
     * Searches through the input array, checking for diffrent bonus types and values, calculating them and adding them all in to a final string value that can be used or set to a final roll
     * Bonuses are an object of a specific setup, including a value, type, source ID, 
     * "Justified" + "Requirements" paramaters to decide if a bonus should be active, 
     * priority to decide strengths of certain clashing mods that would overide eachother
     * 
     * @param {Array} list The array of bonuses to be calculated into a rollable string format
     */
    static bonusFormula(list) {
        var formula = '';
        var value = 0;
        var diceList = [];
        var boost = {active: false, value: 0, priority: 0};
        var limit = {active: false, value: 0, priority: 0};
        var overide = {active: false, value: 0, priority: 0};

        if (!Array.isArray(list)) return '';


        LOGGER.log(`Calculating bonuses`, list);
        //loops through the bonuses array, adding in the values to the final formula
        for (const bonus of system.bonuses) {
            if (bonus.type === `dice`) {
                //adds a dice, or multiple, to the final formula
                //dice can be written using foundry roll expressions for additional effects
                if (Array.isArray(diceList) && diceList.length > 0) {
                    var found = false;
                    for (const d of diceList)
                    {
                        if (d.dice == bonus.value) {
                            found = true;
                            d.count += 1;
                        }
                    }
                    if (!found) {
                        diceList.push({dice: bonus.value, count: 1});
                    }
                } else {
                    diceList.push({dice: bonus.value, count: 1});
                }
            }
            else if (bonus.type === `value`) {
                //flat numeric values, such as a +2 or -1 to a roll, gets added to the value variable and compiled into the string at the end
                value += bonus.value;
            }
            else if (bonus.type === `mod`) {
                //numeric multiplier for adding bonuses to the ammount a value should be multiplied by
            }
            else if (bonus.type === `boost`) {
                //A boost bonus means there is a minimum value to the roll, so a boosted 10 means the overall flat value cannot be less than 10
                if (boost.value < bonus.value || !boost.active) {
                    boost.active = true;
                    boost.value = bonus.value;
                    boost.priority = bonus.priority;
                }
            }
            else if (bonus.type === `limit`) {
                //Limits mean that a certain roll cannot get higher than a specified number, used mainly as a form of debuff
            }
            else if (bonus.type === `set`) {
                //this will set the modifier values to be a flat ammount and simply return the highest set value unless overidden by a limit / boost of higher priority
            }
        }

        var first = true;
        for (let d of diceList) {
            if (!first) formula += `+`;
            formula += d.count + d.dice;
            first = false;
        }

        formula += ``+value;
        return formula;
    }

    static sumArray(list) {
        var value = 0;
        for (const v in list) value += v;
        return value;
    }
}