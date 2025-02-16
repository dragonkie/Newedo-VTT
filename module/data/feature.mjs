
export class NewedoFeature {
    type = 'item';
    label = 'New Item Feature';
    unlock = 0;
    id = foundry.utils.randomID();
}

export class FeatureItem extends NewedoFeature {

}

export class FeatureEffect extends NewedoFeature {

}

export class FeatureTrait extends NewedoFeature {
    type = 'trait';
    static CreateValue(_group='', _key='', _label='') {
        return {
            group: _group,
            key: _key,
            label: _label,
            value: 0,
        }
    }

    constructor() {
        super();
        this.data = {
            groups: [
                { name: 'core', label: 'NEWEDO.generic.core' },
                { name: 'derived', label: 'NEWEDO.generic.derived' },
                { name: 'mod', label: 'NEWEDO.generic.mod' },
                { name: 'background', label: 'NEWEDO.generic.background' },
            ],
            traits: [
                // Core traits
                this.constructor.CreateValue('core', 'HrtTotal', 'NEWEDO.trait.core.abbr.hrt'),
                this.constructor.CreateValue('core', 'PerTotal', 'NEWEDO.trait.core.abbr.per'),
                this.constructor.CreateValue('core', 'PowTotal', 'NEWEDO.trait.core.abbr.pow'),
                this.constructor.CreateValue('core', 'PreTotal', 'NEWEDO.trait.core.abbr.pre'),
                this.constructor.CreateValue('core', 'RefTotal', 'NEWEDO.trait.core.abbr.ref'),
                this.constructor.CreateValue('core', 'SavTotal', 'NEWEDO.trait.core.abbr.sav'),
                this.constructor.CreateValue('core', 'ShiTotal', 'NEWEDO.trait.core.abbr.shi'),
                // Derived traits
                this.constructor.CreateValue('derived', 'DefTotal', 'NEWEDO.trait.derived.abbr.def'),
                this.constructor.CreateValue('derived', 'HpTotal', 'NEWEDO.trait.derived.abbr.hp'),
                this.constructor.CreateValue('derived', 'InitTotal', 'NEWEDO.trait.derived.abbr.init'),
                this.constructor.CreateValue('derived', 'MoveTotal', 'NEWEDO.trait.derived.abbr.move'),
                this.constructor.CreateValue('derived', 'ResTotal', 'NEWEDO.trait.derived.abbr.res'),
                // Derived Modifiers
                this.constructor.CreateValue('mod', 'DefMod', 'Def'),
                this.constructor.CreateValue('mod', 'HpMod', 'Hp'),
                this.constructor.CreateValue('mod', 'InitMod', 'Init'),
                this.constructor.CreateValue('mod', 'LiftMod', 'Lift'),
                this.constructor.CreateValue('mod', 'MoveMod', 'Move'),
                this.constructor.CreateValue('mod', 'ResMod', 'Res'),
                this.constructor.CreateValue('mod', 'RestMod', 'Rest'),
                // Backgrounds
                this.constructor.CreateValue('background', 'contact', 'Contacts'),
                this.constructor.CreateValue('background', 'follower', 'Followers'),
                this.constructor.CreateValue('background', 'soul', 'Soul'),
                this.constructor.CreateValue('background', 'status', 'Status'),
                this.constructor.CreateValue('background', 'wealth', 'Wealth'),
            ],
        }
    }
}