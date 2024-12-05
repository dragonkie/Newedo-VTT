import sysUtil from "../../helpers/sysUtil.mjs";
import LOGGER from "../../helpers/logger.mjs";
import { ActorDataModel } from "../abstract.mjs";
import ResourceField from "../../fields/resource-field.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class CharacterDataModel extends ActorDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.legend = new SchemaField({
            min: new NumberField({ initial: 0 }),
            value: new NumberField({ initial: 0 }),
            max: new NumberField({ initial: 0 })
        });

        schema.xp = new SchemaField({
            value: new NumberField({ initial: 0 })
        });

        schema.money = new SchemaField({
            value: new NumberField({ initial: 0 }),
        });

        schema.background = new SchemaField({
            contacts: this.AddValueField('value', 1),
            followers: this.AddValueField('value', 1),
            soul: this.AddValueField('value', 1),
            status: this.AddValueField('value', 1),
            wealth: this.AddValueField('value', 1),
        });

        return schema;
    }

    get isAlive() {
        return this.hp.value >= 0
    }

    get isDead() {
        return this.hp.value <= 0;
    }

    prepareBaseData() {
        LOGGER.group('CharacterDataModel | prepareBaseData')
        super.prepareBaseData();
        LOGGER.groupEnd();
    }

    prepareDerivedData() {
        LOGGER.group('CharacterDataModel | prepareDerivedData')
        /* ----------------------------------------------------------- */
        /* Background Ranks                                            */
        /* ----------------------------------------------------------- */
        for (let [key, bg] of Object.entries(this.background)) {
            bg.value = sysUtil.clamp(bg.value, 0, 100);// Clamps the value to its range
            bg.rank = sysUtil.backgroundRank(bg.value);// Calculates the rank of the background
        }

        /* ----------------------------------------------------------- */
        /* Background Bonuses                                          */
        /* ----------------------------------------------------------- */
        if (this.background.soul.rank >= 1) this.bonus.HrtTotal.push({ id: 'SoulRank1', source: 'Soul Rank 1', active: true, description: '', value: 3 });
        if (this.background.soul.rank >= 2) this.bonus.PreTotal.push({ id: 'SoulRank2', source: 'Soul Rank 2', active: true, description: '', value: 3 });
        if (this.background.soul.rank >= 3) this.bonus.PerTotal.push({ id: 'SoulRank3', source: 'Soul Rank 3', active: true, description: '', value: 3 });
        if (this.background.soul.rank >= 4) {
            this.bonus.SavTotal.push({ id: 'SoulRank4a', source: 'Soul Rank 4', active: true, description: '', value: 3 });
            this.bonus.PreTotal.push({ id: 'SoulRank4b', source: 'Soul Rank 4', active: true, description: '', value: 3 });
        }
        if (this.background.soul.rank >= 5) {
            this.bonus.SavTotal.push({ id: 'SoulRank4a', source: 'Soul Rank 5', active: true, description: '', value: 5 });
            this.bonus.PowTotal.push({ id: 'SoulRank4b', source: 'Soul Rank 5', active: true, description: '', value: 5 });
        }

        /* ----------------------------------------------------------- */
        /* Generic Actor Super                                         */
        /* ----------------------------------------------------------- */
        super.prepareDerivedData();

        //calculates characters legend rank
        this.legend.rank = sysUtil.legendRank(this.legend.max);

        LOGGER.groupEnd();
    }
}