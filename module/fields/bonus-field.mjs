const { NumberField, BooleanField, StringField } = foundry.data.fields;

export default class BonusField extends foundry.data.fields.SchemaField {
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