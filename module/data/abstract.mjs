import BonusField from "../fields/bonus-field.mjs";
import ResourceField from "../fields/resource-field.mjs";
import LOGGER from "../helpers/logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";


const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField, HTMLField
} = foundry.data.fields;

export default class SystemDataModel extends foundry.abstract.TypeDataModel {
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

    getRollData() {
        // Get owning documents rolldata
        let data = {...this};
        return data;
    }
}

export class ActorDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        schema.hp = new SchemaField({
            min: new NumberField({ initial: 0 }),
            value: new NumberField({ initial: 15, min: 0 }),
            max: new NumberField({ initial: 15 }),
            mod: new NumberField({ initial: 1.5 }),
        });

        schema.size = this.AddValueField('value', 5);

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

        schema.bonus = new SchemaField({
            // Bonus to core trait totals
            PowTotal: new ArrayField(new BonusField(), { initial: [] }),
            PerTotal: new ArrayField(new BonusField(), { initial: [] }),
            PreTotal: new ArrayField(new BonusField(), { initial: [] }),
            HrtTotal: new ArrayField(new BonusField(), { initial: [] }),
            RefTotal: new ArrayField(new BonusField(), { initial: [] }),
            SavTotal: new ArrayField(new BonusField(), { initial: [] }),
            ShiTotal: new ArrayField(new BonusField(), { initial: [] }),

            // Bonus to core trait ranks, very op
            PowRank: new ArrayField(new BonusField(), { initial: [] }),
            PerRank: new ArrayField(new BonusField(), { initial: [] }),
            PreRank: new ArrayField(new BonusField(), { initial: [] }),
            HrtRank: new ArrayField(new BonusField(), { initial: [] }),
            RefRank: new ArrayField(new BonusField(), { initial: [] }),
            SavRank: new ArrayField(new BonusField(), { initial: [] }),
            ShiRank: new ArrayField(new BonusField(), { initial: [] }),

            // Bonus to derived trait totals
            DefTotal: new ArrayField(new BonusField(), { initial: [] }),
            InitTotal: new ArrayField(new BonusField(), { initial: [] }),
            MoveTotal: new ArrayField(new BonusField(), { initial: [] }),
            ResTotal: new ArrayField(new BonusField(), { initial: [] }),

            // Bonus to derived trait base values (these bonuses are applied before the modifier is calculated)
            DefBase: new ArrayField(new BonusField(), { initial: [] }),
            InitBase: new ArrayField(new BonusField(), { initial: [] }),
            MoveBase: new ArrayField(new BonusField(), { initial: [] }),
            ResBase: new ArrayField(new BonusField(), { initial: [] }),

            // Bonus to derived trait mods
            DefMod: new ArrayField(new BonusField(), { initial: [] }),
            InitMod: new ArrayField(new BonusField(), { initial: [] }),
            MoveMod: new ArrayField(new BonusField(), { initial: [] }),
            ResMod: new ArrayField(new BonusField(), { initial: [] }),

            // Healing rate modifier
            RestMod: new ArrayField(new BonusField(), { initial: [] }),

            // Bonus to attacks
            attackMelee: new ArrayField(new BonusField(), { initial: [] }),
            attackRanged: new ArrayField(new BonusField(), { initial: [] }),

            // Bonus to damage
            damageMelee: new ArrayField(new BonusField(), { initial: [] }),
            damageRanged: new ArrayField(new BonusField(), { initial: [] }),
        })

        return schema;
    }

    /* ---------------------------------------------------- */
    /* Data preparation                                     */
    /* ---------------------------------------------------- */
    /**
     * Foundry data preperation goes as follows
     * DataModel prepareBaseData();
     * Document prepareBaseData();
     * EmbeddedDocument();
     * DataModel prepareDerivedData();
     * Document prepareDerivedData();
     * 
     * only prepareData(); and prepareEmbeddedDocuments(); need to call their supers for proper functionality
     * rest can be overidden and inherited as needed
     */

    prepareBaseData() {
        LOGGER.group("ActorDataModel | prepareBaseData");
        LOGGER.groupEnd();
    }

    prepareDerivedData() {
        LOGGER.group("ActorDataModel | prepareDerivedData");

        const { core, derived } = this.traits;

        // Totals up core stats
        core.hrt.total = core.hrt.value;
        core.pow.total = core.pow.value;
        core.per.total = core.per.value;
        core.pre.total = core.pre.value;
        core.ref.total = core.ref.value;
        core.sav.total = core.sav.value;
        core.shi.total = core.shi.value;

        for (let a of this.bonus.HrtTotal) core.hrt.total += a.value;
        for (let a of this.bonus.PowTotal) core.pow.total += a.value;
        for (let a of this.bonus.PerTotal) core.per.total += a.value;
        for (let a of this.bonus.PreTotal) core.pre.total += a.value;
        for (let a of this.bonus.RefTotal) core.ref.total += a.value;
        for (let a of this.bonus.SavTotal) core.sav.total += a.value;
        for (let a of this.bonus.ShiTotal) core.shi.total += a.value;

        // Loop through core traits and calculate their rank, traits are not included in the "Round everything up" rule
        for (let [key, trait] of Object.entries(core)) {
            trait.rank = Math.max(Math.floor(trait.total / 10), 0);
        }

        // Calculates derived traits for initative, move, defence, resolve, and max health
        derived.init.total = Math.ceil((core.sav.total + core.ref.total) * derived.init.mod);
        derived.move.total = Math.ceil(((core.hrt.total + core.ref.total) / this.size.value) * derived.move.mod);
        derived.def.total = Math.ceil((core.pow.total + core.ref.total) * derived.def.mod);
        derived.res.total = Math.ceil((core.hrt.total + core.pre.total) * derived.res.mod);

        // Sets health range, MIN is included for use with the token resource bars and is always 0
        this.hp.max = Math.ceil(core.hrt.total * this.hp.mod);
        this.hp.min = 0;

        // Gets the characters wound state
        this.wound = sysUtil.woundState(this.hp.value / this.hp.max);

        LOGGER.groupEnd();
    }

    getRollData() {
        const data = super.getRollData();
        // Adds trait data directly to the rolldata for easy access
        // such as @pow.rank or @def.total
        for (let [group, traits] of Object.entries(this.traits)) {
            for (let [trait, value] of Object.entries(traits)) {
                data[trait] = value;
            }
        }

        return data;
    }
}

export class ItemDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        schema.description = new HTMLField({ initial: "" });

        return schema;
    }

    prepareBaseData() {
        LOGGER.group("ItemDataModel | prepareBaseData");
        LOGGER.groupEnd();
    }

    prepareDerivedData() {
        LOGGER.group("ItemDataModel | prepareDerivedData"); 
        LOGGER.groupEnd();
    }

    getRollData() {
        const actorData = this.actor?.getRollData();

        const data = {
            ...actorData,
            ...sysUtil.duplicate(this)
        }
        
        return data;
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