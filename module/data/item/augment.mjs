import { ResourceField } from "../fields.mjs";
import { ItemDataModel } from "../abstract.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class AugmentData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.installed = new BooleanField({ initial: false });
        schema.biofeedback = new NumberField({ initial: 0 });
        schema.rank = new ResourceField(1, 1, 5);
        
        schema.noise = new SchemaField({
            hrt: new NumberField({ initial: 0, nullable: false, required: true }),
            ref: new NumberField({ initial: 0, nullable: false, required: true }),
            sav: new NumberField({ initial: 0, nullable: false, required: true }),
            pow: new NumberField({ initial: 0, nullable: false, required: true }),
            pre: new NumberField({ initial: 0, nullable: false, required: true }),
            per: new NumberField({ initial: 0, nullable: false, required: true })
        })

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }
}