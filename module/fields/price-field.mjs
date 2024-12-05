const { NumberField } = foundry.data.fields;

export default class PriceField extends foundry.data.fields.SchemaField {
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