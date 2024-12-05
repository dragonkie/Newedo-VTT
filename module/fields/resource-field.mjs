const { NumberField } = foundry.data.fields;

export default class ResourceField extends foundry.data.fields.SchemaField {
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