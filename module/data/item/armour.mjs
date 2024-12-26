import PriceField from "../../fields/price-field.mjs";
import { ItemDataModel } from "../abstract.mjs";


const {
    ArrayField, BooleanField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

export default class ArmourData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.quality = new NumberField({ initial: 1 });
        schema.price = new PriceField();

        schema.equipped = new BooleanField({ initial: false, required: true });

        schema.soak = new SchemaField({
            kin: new NumberField({ initial: 0, required: true, nullable: false }),
            ele: new NumberField({ initial: 0, required: true, nullable: false }),
            bio: new NumberField({ initial: 0, required: true, nullable: false }),
            arc: new NumberField({ initial: 0, required: true, nullable: false })
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

    get isEquipped() {
        return this.equipped == true;
    }

    async use(action) {
        switch (action) {
            case 'equip': return this._onEquip();
            default:
                LOGGER.error('Unknown weapon action: ', action);
                return null;
        }
    }

    async _onEquip() {
        await this.parent.update({ 'system.equipped': !this.equipped });
    }
}