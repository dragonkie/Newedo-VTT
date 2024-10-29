import sysUtil from "../../helpers/sysUtil.mjs";
import LOGGER from "../../helpers/logger.mjs";
import { ActorDataModel } from "../abstract.mjs";

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
            contacts: this.AddResourceField(0, 100),
            followers: this.AddResourceField(0, 100),
            soul: this.AddResourceField(0, 100),
            status: this.AddResourceField(0, 100),
            wealth: this.AddResourceField(0, 100),
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
        LOGGER.groupCollapsed('CharacterDataModel | prepareBaseData')
        super.prepareBaseData();
        LOGGER.groupEnd();
    }

    prepareDerivedData() {
        LOGGER.groupCollapsed('CharacterDataModel | prepareDerivedData')
        super.prepareDerivedData();
        //calculates ranks for background, idk why it doesnt scale as just 1 rank per 20 points?
        const background = this.background;
        for (let [key, bg] of Object.entries(background)) {
            bg.value = sysUtil.clamp(bg.value, 0, 100);
            bg.rank = sysUtil.backgroundRank(bg.value);
        }

        //calculates characters legend rank
        this.legend.rank = sysUtil.legendRank(this.legend.max);
        LOGGER.groupEnd();
    }

    getTrait(key) {

    }
}