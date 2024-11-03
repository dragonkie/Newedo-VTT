import LOGGER from "../helpers/logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField, HTMLField
} = foundry.data.fields;

export default class SystemDataModel extends foundry.abstract.TypeDataModel {

    /*****************************************/
    /*             SCHEMA HELPERS            */
    /*****************************************/

    /**
     * Creates a resource field with a value, min, and max keys, min is by default 0
     * @param {Number} init the initial value this field starts at
     * @param {Number} max the maximum this field can be
     * @param {Number} min the minimum this field can be
     * @returns {SchemaField}
     */
    static AddResourceField(init, max, min = 0) {
        return new SchemaField({
            min: new NumberField({ initial: min }),
            value: new NumberField({ initial: init }),
            max: new NumberField({ initial: max })
        });
    }

    /**
     * Quick function to create a number value field, but returns full schema field to give space for
     * derived data to extend this particular field context
     * @param {String} key a valid data path name for an object key to asign this value too
     * @param {Number} value the initial value of this entry
     * @returns {SchemaField}
     */
    static AddValueField(key, value) {
        return new SchemaField({
            [key]: new NumberField({ initial: value })
        })
    }

    static AddDiceField(num, faces) {
        return new SchemaField({
            number: new NumberField({ initial: num }),
            faces: new NumberField({ initial: faces })
        })
    }

    /**
     * Returns the roll data from the owning documents getRollData method
     * @returns {Object}
     */
    getRollData() {
        return this.parent.getRollData();
    }
}

export class ActorDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        schema.hp = new SchemaField({
            min: new NumberField({ initial: 0 }),
            value: new NumberField({ initial: 15 }),
            max: new NumberField({ initial: 15 }),
            mod: new NumberField({ initial: 1.5 }),
        });

        schema.size = this.AddResourceField(5, 6);

        schema.traits = new SchemaField({
            core: new SchemaField({
                pow: this.AddValueField('value', 10),
                per: this.AddValueField('value', 10),
                pre: this.AddValueField('value', 10),
                hrt: this.AddValueField('value', 10),
                ref: this.AddValueField('value', 10),
                sav: this.AddValueField('value', 10),
                shi: this.AddValueField('value', 0),
            }),
            derived: new SchemaField({
                init: this.AddValueField('mod', 1),
                move: this.AddValueField('mod', 1),
                def: this.AddValueField('mod', 0.4),
                res: this.AddValueField('mod', 0.4)
            })
        });

        schema.armour = new SchemaField({
            kin: this.AddValueField('value', 0),
            ele: this.AddValueField('value', 0),
            bio: this.AddValueField('value', 0),
            arc: this.AddValueField('value', 0)
        });

        return schema;
    }

    prepareData() {
        LOGGER.group("ActorDataModel | prepareData");
        LOGGER.groupEnd();
    }

    prepareBaseData() {
        LOGGER.group("ActorDataModel | prepareBaseData");
        LOGGER.groupEnd();
    }

    prepareDerivedData() {
        LOGGER.group("ActorDataModel | prepareDerivedData");
        const { core, derived } = this.traits;

        // Loop through core traits and calculate their rank, traits are not included in the "Round everything up" rule
        for (let [key, trait] of Object.entries(core)) {
            trait.rank = Math.max(Math.floor(trait.value / 10), 0);
        }

        // Calculates derived traits for initative, move, defence, resolve, and max health
        derived.init.total = Math.ceil((core.sav.value + core.ref.value) * derived.init.mod);
        derived.move.total = Math.ceil(((core.hrt.value + core.ref.value) / this.size.value) * derived.move.mod);
        derived.def.total = Math.ceil((core.pow.value + core.ref.value) * derived.def.mod);
        derived.res.total = Math.ceil((core.hrt.value + core.pre.value) * derived.res.mod);

        // Sets health range, MIN is included for use with the token resource bars
        this.hp.max = Math.ceil(core.hrt.value * this.hp.mod);
        this.hp.min = 0;

        // Gets the characters wound state
        this.wound = sysUtil.woundState(this.hp.value / this.hp.max);
        LOGGER.groupEnd();
    }
}

export class ItemDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        schema.description = new HTMLField({ initial: "" });

        return schema;
    }

    static AddPriceField(base, min, max, tn) {
        return new SchemaField({
            value: new NumberField({ initial: base }),
            min: new NumberField({ initial: min }),
            max: new NumberField({ initial: max }),
            tn: new NumberField({ initial: tn }),
        })
    }

    getRollData() {
        // Items can only return rolldata when they have an owning actor
        if (!this.actor) return null;
        return super.getRollData();
    }

    /**
     * Quick reference to the actor getter of the parent document
     */
    get actor() {
        return this.parent.actor;
    }

    async use(action) {
        LOGGER.error(`Unhandled use action for id ${this.parent.uuid}:`, action);
    }
}