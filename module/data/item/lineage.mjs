import { ItemDataModel } from "../abstract.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class LineageData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.traits = new SchemaField({
            core: new SchemaField({
                pow: new NumberField({ initial: 0 }),
                per: new NumberField({ initial: 0 }),
                pre: new NumberField({ initial: 0 }),
                hrt: new NumberField({ initial: 0 }),
                ref: new NumberField({ initial: 0 }),
                sav: new NumberField({ initial: 0 }),
                shi: new NumberField({ initial: 0 })
            }),
            derived: new SchemaField({
                init: new SchemaField({
                    value: new NumberField({ initial: 0 }),
                    total: new NumberField({ initial: 0 }),
                    mod: new NumberField({ initial: 0 })
                }),
                move: new SchemaField({
                    value: new NumberField({ initial: 0 }),
                    total: new NumberField({ initial: 0 }),
                    mod: new NumberField({ initial: 0 })
                }),
                def: new SchemaField({
                    value: new NumberField({ initial: 0 }),
                    total: new NumberField({ initial: 0 }),
                    mod: new NumberField({ initial: 0 })
                }),
                res: new SchemaField({
                    value: new NumberField({ initial: 0 }),
                    total: new NumberField({ initial: 0 }),
                    mod: new NumberField({ initial: 0 })
                }),
                hp: new SchemaField({
                    value: new NumberField({ initial: 0 }),
                    total: new NumberField({ initial: 0 }),
                    mod: new NumberField({ initial: 0 })
                })
            })
        });

        schema.lift = new SchemaField({
            value: new NumberField({ initial: 0 }),
            mod: new NumberField({ initial: 0 })
        });

        schema.rest = new SchemaField({
            value: new NumberField({ initial: 0 }),
            mod: new NumberField({ initial: 0 })
        });

        schema.armour = new SchemaField({
            kin: this.AddValueField('value', 0),
            ele: this.AddValueField('value', 0),
            bio: this.AddValueField('value', 0),
            arc: this.AddValueField('value', 0)
        });

        return schema;
    }
}