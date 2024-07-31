import NewedoItem from "../item.mjs";

export default class NewedoFate extends NewedoItem {
    constructor(data, options) {
        super(data, options);
    }

    prepareDerivedData() {
        var range = this.system.range;

        // Bitwise operator to quickly swap the values of the 2 ranges, dont know how this works
        if (range.min > range.max) {
            range.max = range.max^range.min;
            range.min = range.max^range.min;
            range.max = range.max^range.min;
        }
        // Gathers bonuses from
        let val = 0;
        for (const bonus of range.bonuses) {
            val += bonus.value;
        }
        range.max += val;
        range.value = range.max - range.min + 1;

        if (range.max > 100) {
            LOGGER.error(`Fate ${itemData.name} has an out of scope range`);
            range.min -= range.max - 100;
            range.max -= range.max - 100;
        }
    }
}