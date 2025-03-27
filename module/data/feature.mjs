export class FeatureData {
    constructor() {
        this.id = foundry.utils.randomID();
        this.type = 'item';
        this.label = 'New Feature';
        this.unlock = 0;
        this.data = {};
    }
}

export class FeatureItemData extends FeatureData {
    constructor() {
        super();
        this.label = 'New Item Feature'
        this.data = {
            items: []
        }
    }
}

export class FeatureEffectData extends FeatureData {

}

export class FeatureTraitData extends FeatureData {
    type = 'trait';
    CreateValue(_group = '', _key = '', _label = '') {
        return {
            group: _group,
            key: _key,
            label: _label,
            value: 0,
        }
    }

    constructor() {
        super();
        this.label = 'New Trait Feature';
        this.data = {
            groups: [
                { name: 'core', label: newedo.config.generic.core },
                { name: 'derived', label: newedo.config.generic.derived },
                { name: 'mod', label: newedo.config.generic.mod },
                { name: 'background', label: newedo.config.generic.background },
            ],
            traits: [
                // Derived Modifiers
                this.CreateValue('mod', 'DefMod', 'Def'),
                this.CreateValue('mod', 'HpMod', 'Hp'),
                this.CreateValue('mod', 'InitMod', 'Init'),
                this.CreateValue('mod', 'LiftMod', 'Lift'),
                this.CreateValue('mod', 'MoveMod', 'Move'),
                this.CreateValue('mod', 'ResMod', 'Res'),
                this.CreateValue('mod', 'RestMod', 'Rest'),
            ],
        }

        // Add core traits
        for (const [key, value] of Object.entries(newedo.config.traitsCore)) {
            this.data.traits.push(this.CreateValue('core', key, value))
        }

        // Add Derived traits
        for (const [key, value] of Object.entries(newedo.config.traitsDerived)) {
            this.data.traits.push(this.CreateValue('derived', key, value))
        }

        // Add Derived traits
        for (const [key, value] of Object.entries(newedo.config.background)) {
            this.data.traits.push(this.CreateValue('background', key, value))
        }
    }
}