import { ItemDataModel } from "../abstract.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class AugmentData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.installed = new BooleanField({ initial: false });
        schema.biofeedback = new NumberField({ initial: 0 });
        schema.rank = this.AddResourceField(1, 5, 1);
        
        schema.noise = new SchemaField({
            hrt: new NumberField({ initial: 0 }),
            ref: new NumberField({ initial: 0 }),
            sav: new NumberField({ initial: 0 }),
            pow: new NumberField({ initial: 0 }),
            pre: new NumberField({ initial: 0 }),
            per: new NumberField({ initial: 0 })
        })

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }
}