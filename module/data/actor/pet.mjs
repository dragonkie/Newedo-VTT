import { ActorDataModel } from "../abstract.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class PetDataModel extends ActorDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.type = new StringField({ initial: "animal" })

        return schema;
    }

    get isAlive() {
        return this.hp.value >= 0
    }

    get isDead() {
        return this.hp.value <= 0;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }
}