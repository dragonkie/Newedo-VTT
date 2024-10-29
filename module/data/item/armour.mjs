import { ItemDataModel } from "../abstract.mjs";


const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class ArmourData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.quality = new NumberField({ initial: 1 });
        schema.price = this.AddPriceField(100, 50, 100, 3);

        schema.soak = new SchemaField({
            kin: new NumberField({ initial: 0 }),
            ele: new NumberField({ initial: 0 }),
            bio: new NumberField({ initial: 0 }),
            arc: new NumberField({ initial: 0 })
        })

        schema.conceal = new BooleanField({ initial: false });
        schema.fragile = new BooleanField({ initial: false });
        schema.stealth = new BooleanField({ initial: false });
        schema.intimidating = new BooleanField({ initial: false });

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }
}