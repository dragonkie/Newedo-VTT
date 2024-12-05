const { NumberField } = foundry.data.fields;

export default class GritField extends foundry.data.fields.SchemaField {
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