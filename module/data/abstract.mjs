import BonusField from "../fields/bonus-field.mjs";
import ResourceField from "../fields/resource-field.mjs";
import LOGGER from "../helpers/logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";


const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField, HTMLField
} = foundry.data.fields;

export class SystemDataModel extends foundry.abstract.TypeDataModel {
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
        let data = { ...this };
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
            PowTotal: new NumberField({ initial: 0 }),
            PerTotal: new NumberField({ initial: 0 }),
            PreTotal: new NumberField({ initial: 0 }),
            HrtTotal: new NumberField({ initial: 0 }),
            RefTotal: new NumberField({ initial: 0 }),
            SavTotal: new NumberField({ initial: 0 }),
            ShiTotal: new NumberField({ initial: 0 }),

            // Bonus to core trait ranks, very op
            PowRank: new NumberField({ initial: 0 }),
            PerRank: new NumberField({ initial: 0 }),
            PreRank: new NumberField({ initial: 0 }),
            HrtRank: new NumberField({ initial: 0 }),
            RefRank: new NumberField({ initial: 0 }),
            SavRank: new NumberField({ initial: 0 }),
            ShiRank: new NumberField({ initial: 0 }),

            // Bonus to derived trait totals
            DefTotal: new NumberField({ initial: 0 }),
            InitTotal: new NumberField({ initial: 0 }),
            MoveTotal: new NumberField({ initial: 0 }),
            ResTotal: new NumberField({ initial: 0 }),

            // Bonus to derived trait base values (these bonuses are applied before the modifier is calculated)
            DefBase: new NumberField({ initial: 0 }),
            ResBase: new NumberField({ initial: 0 }),
            InitBase: new NumberField({ initial: 0 }),
            MoveBase: new NumberField({ initial: 0 }),

            // Bonus to derived trait mods
            DefMod: new NumberField({ initial: 0 }),
            ResMod: new NumberField({ initial: 0 }),
            InitMod: new NumberField({ initial: 0 }),
            MoveMod: new NumberField({ initial: 0 }),

            // Health modifiers
            HpBase: new NumberField({ initial: 0 }),
            HpTotal: new NumberField({ initial: 0 }),
            HpMod: new NumberField({ initial: 0 }),
            RestMod: new NumberField({ initial: 0 }),

            // Bonus to attacks
            attackMelee: new NumberField({ initial: 0 }),
            attackRanged: new NumberField({ initial: 0 }),

            // Bonus to damage
            damageMelee: new NumberField({ initial: 0 }),
            damageRanged: new NumberField({ initial: 0 }),

            // Bonus to soaks
            SoakKin: new NumberField({initial: 0}),
            SoakEle: new NumberField({initial: 0}),
            SoakBio: new NumberField({initial: 0}),
            SoakArc: new NumberField({initial: 0}),
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
        const bonus = this.bonus;



        // Totals up core stats
        core.hrt.total = core.hrt.value;
        core.pow.total = core.pow.value;
        core.per.total = core.per.value;
        core.pre.total = core.pre.value;
        core.ref.total = core.ref.value;
        core.sav.total = core.sav.value;
        core.shi.total = core.shi.value;

        core.hrt.total += bonus.HrtTotal;
        core.pow.total += bonus.PowTotal;
        core.per.total += bonus.PerTotal;
        core.pre.total += bonus.PreTotal;
        core.ref.total += bonus.RefTotal;
        core.sav.total += bonus.SavTotal;
        core.shi.total += bonus.ShiTotal;

        /*
        for (let a of bonus.HrtTotal) core.hrt.total += a.value;
        for (let a of bonus.PowTotal) core.pow.total += a.value;
        for (let a of bonus.PerTotal) core.per.total += a.value;
        for (let a of bonus.PreTotal) core.pre.total += a.value;
        for (let a of bonus.RefTotal) core.ref.total += a.value;
        for (let a of bonus.SavTotal) core.sav.total += a.value;
        for (let a of bonus.ShiTotal) core.shi.total += a.value;
        */

        /* ----------------------------------------------------------- */
        /* Equipped item modifiers                                     */
        /* ----------------------------------------------------------- */
        for (const item of this.parent.items.contents) {
            if (item.type == 'armour' && item.system.isEquipped) {
                this.bonus.SoakKin += item.system.soak.kin;
                this.bonus.SoakEle += item.system.soak.ele;
                this.bonus.SoakBio += item.system.soak.bio;
                this.bonus.SoakArc += item.system.soak.arc;
            }
        }

        // Loop through core traits and calculate their rank, traits are not included in the "Round everything up" rule
        for (let [key, trait] of Object.entries(core)) {
            trait.rank = Math.max(Math.floor(trait.total / 10), 0);
        }

        // Calculates derived traits for initative, move, defence, resolve, and max health
        derived.init.total = Math.ceil((core.sav.total + core.ref.total + bonus.InitBase) * (derived.init.mod + bonus.InitMod)) + bonus.InitTotal;
        derived.move.total = Math.ceil((((core.hrt.total + core.ref.total) / this.size.value) + bonus.MoveBase) * (derived.move.mod + bonus.MoveMod)) + bonus.MoveTotal;
        derived.def.total = Math.ceil((core.pow.total + core.ref.total + bonus.DefBase) * (derived.def.mod + bonus.DefMod)) + bonus.DefTotal;
        derived.res.total = Math.ceil((core.hrt.total + core.pre.total + bonus.ResBase) * (derived.res.mod + bonus.ResMod)) + bonus.ResTotal;

        // Sets health range, MIN is included for use with the token resource bars and is always 0
        this.hp.max = Math.ceil(core.hrt.total * (this.hp.mod + bonus.HpMod)) + bonus.HpTotal;
        this.hp.min = 0;

        // Gets the characters wound state
        this.wound = sysUtil.woundState(this.hp.value / this.hp.max);

        this.armour.kin.total = this.armour.kin.value + bonus.SoakKin;
        this.armour.ele.total = this.armour.ele.value + bonus.SoakEle;
        this.armour.bio.total = this.armour.bio.value + bonus.SoakBio;
        this.armour.arc.total = this.armour.arc.value + bonus.SoakArc;

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