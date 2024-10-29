import { ItemDataModel } from "../abstract.mjs";

const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class RoteData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.rank = new NumberField({ initial: 1 });
        schema.range = new NumberField({ initial: 1 });
        schema.legend = new NumberField({ initial: 1 });
        schema.duration = new NumberField({ initial: 1 });
        schema.skill = new SchemaField({
            slug: new StringField({ initial: 'arcana' }),
            id: new StringField({ initial: '' })
        });
        schema.tn = new NumberField({ initial: 1 });
        schema.action = new StringField({ initial: 1 });

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        // Prep data relevant to skill
        if (this.actor) {
            this.skill.slug = this.actor.items.get(this.skill.id).system.slug;
        } else {
            this.skill.id = '';
        }

        // Add a localizeable label to the skill slug to make life easier
        this.skill.label = `NEWEDO.skill.${this.skill.slug}`;
    }
}