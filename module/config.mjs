import sysUtil from "./helpers/sysUtil.mjs";

// Exported object
export const NEWEDO = {};

// Add the global API, and add the system utils to it immedieatly for use


// Base data
NEWEDO.traitsCore = {
    pow: "NEWEDO.Trait.Core.Pow.long",
    ref: "NEWEDO.Trait.Core.Ref.long",
    hrt: "NEWEDO.Trait.Core.Hrt.long",
    sav: "NEWEDO.Trait.Core.Sav.long",
    shi: "NEWEDO.Trait.Core.Shi.long",
    per: "NEWEDO.Trait.Core.Per.long",
    pre: "NEWEDO.Trait.Core.Pre.long",
}

NEWEDO.traitsCoreAbbr = {};
for (const [k, v] of Object.entries(NEWEDO.traitsCore)) {
    NEWEDO.traitsCoreAbbr[k] = v.replace('long', 'abbr')
}

NEWEDO.traitsDerived = {
    init: "NEWEDO.Trait.Derived.Init.long",
    move: "NEWEDO.Trait.Derived.Move.long",
    def: "NEWEDO.Trait.Derived.Def.long",
    res: "NEWEDO.Trait.Derived.Res.long",
    hp: "NEWEDO.Trait.Derived.Hp.long",
}

NEWEDO.traitsDerivedAbbr = {};
for (const [k, v] of Object.entries(NEWEDO.traitsDerived)) {
    NEWEDO.traitsDerivedAbbr[k] = v.replace('long', 'abbr')
}

NEWEDO.traits = {
    ...NEWEDO.traitsCore,
    ...NEWEDO.traitsDerived
}

NEWEDO.traitsAbbr = {
    ...NEWEDO.traitsCoreAbbr,
    ...NEWEDO.traitsDerivedAbbr
}

NEWEDO.generic = {
    legend: "NEWEDO.Generic.legend",
    damage: "NEWEDO.Generic.damage",
    trait: "NEWEDO.Generic.trait",
    rank: "NEWEDO.Generic.rank",
    armour: "NEWEDO.Generic.armour",
    soak: "NEWEDO.Generic.soak",
    level: "NEWEDO.Generic.level",
    rest: "NEWEDO.Generic.Rest",
    lift: "NEWEDO.Generic.Lift",
    jump: "NEWEDO.Generic.Jump",
};

NEWEDO.effect = {
    create: "NEWEDO.EffectCreate",
    delete: "NEWEDO.EffectDelete",
    toggle: "NEWEDO.EffectToggle",
    edit: "NEWEDO.EffectEdit"
}

NEWEDO.woundStatus = {
    healthy: "NEWEDO.Wound.Status.Healthy",
    grazed: "NEWEDO.Wound.Status.Grazed",
    wounded: "NEWEDO.Wound.Status.Wounded",
    bloody: "NEWEDO.Wound.Status.Bloody",
    beaten: "NEWEDO.Wound.Status.Beaten",
    burning: "NEWEDO.Wound.Status.Burning",
}

NEWEDO.damage = {
    kin: "NEWEDO.Damage.Kin.long",
    ele: "NEWEDO.Damage.Ele.long",
    bio: "NEWEDO.Damage.Bio.long",
    arc: "NEWEDO.Damage.Arc.long",
}

NEWEDO.damageAbbr = {};
for (const [k, v] of Object.entries(NEWEDO.damage)) {
    NEWEDO.damageAbbr[k] = v.replace('long', 'abbr')
}

NEWEDO.attribute = {
    exp: "NEWEDO.attribute.exp",
    lvl: "NEWEDO.attribute.lvl",
    size: "NEWEDO.attribute.size",
};

NEWEDO.skillsHeart = {
    crafting: "NEWEDO.Skill.Crafting.long",
    meditation: "NEWEDO.Skill.Meditation.long",
    rally: "NEWEDO.Skill.Rally.long",
    survival: "NEWEDO.Skill.Survival.long",
};
NEWEDO.skillsPerception = {
    archery: "NEWEDO.Skill.Archery.long",
    commerce: "NEWEDO.Skill.Commerce.long",
    gunnery: "NEWEDO.Skill.Gunnery.long",
    intuition: "NEWEDO.Skill.Intuition.long",
    investigation: "NEWEDO.Skill.Investigation.long",
    smallArms: "NEWEDO.Skill.SmallArms.long",
};
NEWEDO.skillsPower = {
    athletics: "NEWEDO.Skill.Athletics.long",
    heavyMelee: "NEWEDO.Skill.HeavyMelee.long",
    lightMelee: "NEWEDO.Skill.LightMelee.long",
    thrown: "NEWEDO.Skill.Thrown.long",
    unarmed: "NEWEDO.Skill.Unarmed.long",
};
NEWEDO.skillsPresence = {
    deception: "NEWEDO.Skill.Deception.long",
    eloquence: "NEWEDO.Skill.Eloquence.long",
    intimidation: "NEWEDO.Skill.Intimidation.long",
    performance: "NEWEDO.Skill.Performance.long",
    seduction: "NEWEDO.Skill.Seduction.long",
};
NEWEDO.skillsReflex = {
    banter: "NEWEDO.Skill.Banter.long",
    dodge: "NEWEDO.Skill.Dodge.long",
    drive: "NEWEDO.Skill.Drive.long",
    sleightOfHand: "NEWEDO.Skill.SleightOfHand.long",
    stealth: "NEWEDO.Skill.Stealth.long",
};
NEWEDO.skillsSavvy = {
    arcana: "NEWEDO.Skill.Arcana.long",
    computers: "NEWEDO.Skill.Computers.long",
    gambling: "NEWEDO.Skill.Gambling.long",
    hardware: "NEWEDO.Skill.Hardware.long",
    medicine: "NEWEDO.Skill.Medicine.long",
    security: "NEWEDO.Skill.Security.long",
    streetwise: "NEWEDO.Skill.Streetwise.long",
    study: "NEWEDO.Skill.Study.long",
    surveillance: "NEWEDO.Surveillance.Stealth.long",
    tactics: "NEWEDO.Skill.Tactics.long",
    toxicology: "NEWEDO.Skill.Toxicology.long",
    wetware: "NEWEDO.Skill.Wetware.long",
};

NEWEDO.skills = {
    ...NEWEDO.skillsHeart,
    ...NEWEDO.skillsPerception,
    ...NEWEDO.skillsPower,
    ...NEWEDO.skillsPresence,
    ...NEWEDO.skillsReflex,
    ...NEWEDO.skillsSavvy
};

NEWEDO.weaponSkillsMelee = {
    lightMelee: NEWEDO.skills.lightMelee,
    heavyMelee: NEWEDO.skills.heavyMelee,
    unarmed: NEWEDO.skills.unarmed,
    thrown: NEWEDO.skills.thrown,
}

NEWEDO.weaponSkillsRanged = {
    archery: NEWEDO.skills.archery,
    gunnery: NEWEDO.skills.gunnery,
    smallArms: NEWEDO.skills.smallArms
}

NEWEDO.weaponSkills = {
    ...NEWEDO.weaponSkillsMelee,
    ...NEWEDO.weaponSkillsRanged
}

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
    contacts: "NEWEDO.Background.Contacts",
    followers: "NEWEDO.Background.Followers",
    soul: "NEWEDO.Background.Soul",
    status: "NEWEDO.Background.Status",
    wealth: "NEWEDO.Background.Wealth",
};

NEWEDO.itemTypes = {
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
}

NEWEDO.actorTypes = {
    character: "TYPES.Actor.character",
    npc: "TYPES.Actor.npc",
    pet: "TYPES.Actor.pet",
    vehicle: "TYPES.Actor.vehicle",
}

NEWEDO.types = {
    ...NEWEDO.actorTypes,
    ...NEWEDO.itemTypes
}

NEWEDO.biography = {
    personality: "NEWEDO.biography.personality",
    appearance: "NEWEDO.biography.appearance",
    background: "NEWEDO.biography.background",
    ambition: "NEWEDO.biography.ambition",
    ideal: "NEWEDO.biography.ideal",
    fear: "NEWEDO.biography.fear"
}