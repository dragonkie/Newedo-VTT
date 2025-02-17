// Exported object
export const NEWEDO = {};

NEWEDO.traitsCore = {
    pow: "NEWEDO.Trait.Core.Pow.long",
    ref: "NEWEDO.Trait.Core.Ref.long",
    hrt: "NEWEDO.Trait.Core.Hrt.long",
    sav: "NEWEDO.Trait.Core.Sav.long",
    shi: "NEWEDO.Trait.Core.Shi.long",
    per: "NEWEDO.Trait.Core.Per.long",
    pre: "NEWEDO.Trait.Core.Pre.long",
}

NEWEDO.traitsCoreAbbreviations = {
    pow: "NEWEDO.Trait.Core.Pow.abbr",
    ref: "NEWEDO.Trait.Core.Ref.abbr",
    hrt: "NEWEDO.Trait.Core.Hrt.abbr",
    sav: "NEWEDO.Trait.Core.Sav.abbr",
    shi: "NEWEDO.Trait.Core.Shi.abbr",
    per: "NEWEDO.Trait.Core.Per.abbr",
    pre: "NEWEDO.Trait.Core.Pre.abbr",
}

NEWEDO.traitsDerived = {
    init: "NEWEDO.Trait.Derived.Init",
    move: "NEWEDO.Trait.Derived.Move",
    def: "NEWEDO.Trait.Derived.Def",
    res: "NEWEDO.Trait.Derived.Res",
    hp: "NEWEDO.Trait.Derived.Hp",
}

NEWEDO.traitsDerivedAbbreviations = {
    init: "NEWEDO.Trait.Derived.Init.abbr",
    move: "NEWEDO.Trait.Derived.Move.abbr",
    def: "NEWEDO.Trait.Derived.Def.abbr",
    res: "NEWEDO.Trait.Derived.Res.abbr",
    hp: "NEWEDO.Trait.Derived.Hp.abbr",
}

NEWEDO.generic = {
    legend: "NEWEDO.generic.legend",
    damage: "NEWEDO.generic.damage",
    trait: "NEWEDO.generic.trait",
    rank: "NEWEDO.generic.rank",
    armour: "NEWEDO.generic.armour",
    soak: "NEWEDO.generic.soak",
    level: "NEWEDO.generic.level"
};

NEWEDO.effect = {
    create: "NEWEDO.EffectCreate",
    delete: "NEWEDO.EffectDelete",
    toggle: "NEWEDO.EffectToggle",
    edit: "NEWEDO.EffectEdit"
}

NEWEDO.wound = {
    healthy: "NEWEDO.wound.healthy",
    grazed: "NEWEDO.wound.grazed",
    wounded: "NEWEDO.wound.wounded",
    bloody: "NEWEDO.wound.bloody",
    beaten: "NEWEDO.wound.beaten",
    burning: "NEWEDO.wound.burning",
}

NEWEDO.damage = {
    kin: "NEWEDO.Damage.Kin.long",
    ele: "NEWEDO.Damage.Ele.long",
    bio: "NEWEDO.Damage.Bio.long",
    arc: "NEWEDO.Damage.Arc.long",
}

NEWEDO.damageAbbreviations = {
    kin: "NEWEDO.Damage.Kin.abbr",
    ele: "NEWEDO.Damage.Ele.abbr",
    bio: "NEWEDO.Damage.Bio.abbr",
    arc: "NEWEDO.Damage.Arc.abbr",
}

NEWEDO.attribute = {
    exp: "NEWEDO.attribute.exp",
    lvl: "NEWEDO.attribute.lvl",
    size: "NEWEDO.attribute.size",
};
//Sorted A-Z, grouped by trait

NEWEDO.sheet = {
    tab: {// Navigation tabs
        trait: "NEWEDO.tab.traits",
        skill: "NEWEDO.tab.skill",
        fate: "NEWEDO.tab.fate",
        item: "NEWEDO.tab.item",
        magic: "NEWEDO.tab.magic",
        biography: "NEWEDO.tab.biography"
    }
}

NEWEDO.background = {
    contacts: "NEWEDO.background.contacts",
    followers: "NEWEDO.background.followers",
    status: "NEWEDO.background.status",
    wealth: "NEWEDO.background.wealth",
    soul: "NEWEDO.background.soul",
};

NEWEDO.types = {
    item: {
        ammo: "TYPES.Item.ammo",
        armour: "TYPES.Item.armour",
        augment: "TYPES.Item.augment",
        culture: "TYPES.Item.culture",
        fate: "TYPES.Item.fate",
        feature: "TYPES.Item.feature",
        kami: "TYPES.Item.kami",
        lineage: "TYPES.Item.lineage",
        path: "TYPES.Item.path",
        rote: "TYPES.Item.rote",
        skill: "TYPES.Item.skill",
        upgrade: "TYPES.Item.upgrade",
        weapon: "TYPES.Item.weapon"
    },
    actor: {
        character: "TYPES.Actor.character",
        npc: "TYPES.Actor.npc",
        pet: "TYPES.Actor.pet",
        vehicle: "TYPES.Actor.vehicle",
    }
}

NEWEDO.biography = {
    personality: "NEWEDO.biography.personality",
    appearance: "NEWEDO.biography.appearance",
    background: "NEWEDO.biography.background",
    ambition: "NEWEDO.biography.ambition",
    ideal: "NEWEDO.biography.ideal",
    fear: "NEWEDO.biography.fear"
}