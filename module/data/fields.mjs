const { NumberField, BooleanField, StringField, SchemaField } = foundry.data.fields;

export class ResourceField extends SchemaField {
    constructor(value = 0, min = 0, max = 5, options = {}) {
        const numberConfig = { required: true, nullable: false };
        let fields = {
            value: new NumberField({ ...numberConfig, initial: value, label: "NEWEDO.ResourceField.value" }),
            min: new NumberField({ ...numberConfig, initial: min, label: "NEWEDO.ResourceField.min" }),
            max: new NumberField({ ...numberConfig, initial: max, label: "NEWEDO.ResourceField.max" }),
        }
        super(fields, { label: "NEWEDO.ResourceField", ...options })
    }
}

export class PriceField extends SchemaField {
    constructor(fields = {}, options = {}) {
        const numberConfig = { required: true, nullable: false, initial: 0, min: 0 };
        fields = {
            value: new NumberField({ ...numberConfig, label: "NEWEDO.PriceField.value" }),
            min: new NumberField({ ...numberConfig, label: "NEWEDO.PriceField.min" }),
            max: new NumberField({ ...numberConfig, label: "NEWEDO.PriceField.max" }),
            tn: new NumberField({ ...numberConfig, label: "NEWEDO.PriceField.tn" })
        }

        super(fields, { label: "NEWEDO.PriceField", ...options })
    }
}

export class GritField extends SchemaField {
    constructor(fields = {}, options = {}) {
        const numberConfig = { required: true, nullable: false, initial: 0, min: 0 };
        fields = {
            value: new NumberField({ ...numberConfig, label: "NEWEDO.GritField.value" }),
            atk: new NumberField({ ...numberConfig, label: "NEWEDO.GritField.attack" }),
            dmg: new NumberField({ ...numberConfig, label: "NEWEDO.GritField.damage" })
        }

        super(fields, { label: "NEWEDO.GritField", ...options })
    }
}

export class BonusField extends SchemaField {
    constructor(fields = {}, options = {}) {
        const numberConfig = { required: true, nullable: false, initial: 0 };
        const stringConfig = { required: true, nullable: false, initial: '' };
        const booleanConfig = { required: true, nullable: false, initial: true };
        fields = {
            value: new NumberField({ ...numberConfig, label: 'NEWEDO.bonus.value' }),
            source: new StringField({ ...stringConfig, label: 'NEWEDO.bonus.source' }),
            active: new BooleanField({ ...booleanConfig, label: 'NEWEDO.bonus.active' }),
            description: new StringField({ ...stringConfig, label: 'NEWEDO.bonus.description' }),
            id: new StringField({...stringConfig, label: 'NEWEDO.bonus.id'})
        }

        super(fields, { label: "NEWEDO.bonusField", ...options })
    }
}

export default {
    BonusField,
    GritField,
    PriceField,
    ResourceField
}