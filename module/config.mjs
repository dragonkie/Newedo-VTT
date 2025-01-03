// Exported object
export const NEWEDO = {};

NEWEDO.trait = {
    core: {
        pow: "NEWEDO.trait.core.pow",
        ref: "NEWEDO.trait.core.ref",
        hrt: "NEWEDO.trait.core.hrt",
        sav: "NEWEDO.trait.core.sav",
        shi: "NEWEDO.trait.core.shi",
        per: "NEWEDO.trait.core.per",
        pre: "NEWEDO.trait.core.pre",
        abbr: {
            pow: "NEWEDO.trait.core.abbr.pow",
            ref: "NEWEDO.trait.core.abbr.ref",
            hrt: "NEWEDO.trait.core.abbr.hrt",
            sav: "NEWEDO.trait.core.abbr.sav",
            shi: "NEWEDO.trait.core.abbr.shi",
            per: "NEWEDO.trait.core.abbr.per",
            pre: "NEWEDO.trait.core.abbr.pre",
        },
    },
    derived: {
        init: "NEWEDO.trait.derived.init",
        move: "NEWEDO.trait.derived.move",
        def: "NEWEDO.trait.derived.def",
        res: "NEWEDO.trait.derived.res",
        hp: "NEWEDO.trait.derived.hp",
        abbr: {
            init: "NEWEDO.trait.derived.abbr.init",
            move: "NEWEDO.trait.derived.abbr.move",
            def: "NEWEDO.trait.derived.abbr.def",
            res: "NEWEDO.trait.derived.abbr.res",
            hp: "NEWEDO.trait.derived.abbr.hp",
        }
    }
};

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
    kin: "NEWEDO.damage.kin",
    ele: "NEWEDO.damage.ele",
    bio: "NEWEDO.damage.bio",
    arc: "NEWEDO.damage.arc",
    abbr: {
        kin: "NEWEDO.damage.abbr.kin",
        ele: "NEWEDO.damage.abbr.ele",
        bio: "NEWEDO.damage.abbr.bio",
        arc: "NEWEDO.damage.abbr.arc",
    }
}

NEWEDO.attribute = {
    exp: "NEWEDO.attribute.exp",
    lvl: "NEWEDO.attribute.lvl",
    size: "NEWEDO.attribute.size",
};
//Sorted A-Z, grouped by trait
NEWEDO.skill = {
    hrt: {
        crafting: "NEWEDO.skill.crafting",
        meditation: "NEWEDO.skill.meditation",
        rally: "NEWEDO.skill.rally",
        survival: "NEWEDO.skill.survival",
    },
    pow: {
        athletics: "NEWEDO.skill.athletics",
        meleeheavy: "NEWEDO.skill.meleeHeavy",
        meleelight: "NEWEDO.skill.meleeLight",
        thrown: "NEWEDO.skill.thrown",
        unarmed: "NEWEDO.skill.unarmed",
    },
    ref: {
        banter: "NEWEDO.skill.banter",
        dodge: "NEWEDO.skill.dodge",
        drive: "NEWEDO.skill.drive",
        sleightofhand: "NEWEDO.skill.sleightOfHand",
        stealth: "NEWEDO.skill.stealth",
    },
    pre: {
        deception: "NEWEDO.skill.deception",
        eloquence: "NEWEDO.skill.eloquence",
        intimidation: "NEWEDO.skill.intimidation",
        performance: "NEWEDO.skill.performance",
        seduction: "NEWEDO.skill.seduction",
    },
    per: {
        archery: "NEWEDO.skill.archery",
        commerce: "NEWEDO.skill.commerce",
        gunnery: "NEWEDO.skill.gunnery",
        inuition: "NEWEDO.skill.intuition",
        investigation: "NEWEDO.skill.investigation",
        smallarms: "NEWEDO.skill.smallarms",
    },
    sav: {
        arcana: "NEWEDO.skill.arcana",
        computers: "NEWEDO.skill.computers",
        gambling: "NEWEDO.skill.gambling",
        hardware: "NEWEDO.skill.hardware",
        medicine: "NEWEDO.skill.medicine",
        security: "NEWEDO.skill.security",
        streetwise: "NEWEDO.skill.streetwise",
        study: "NEWEDO.skill.study",
        surveillance: "NEWEDO.skill.surveillance",
        tactics: "NEWEDO.skill.tactics",
        toxicology: "NEWEDO.skill.toxicology",
        wetware: "NEWEDO.skill.wetware",
    }
};

NEWEDO.WeaponSkill = {
    melee: {
        meleeLight: 'NEWEDO.skill.meleeLight',
        meleeHeavy: 'NEWEDO.skill.meleeHeavy',
        unarmed: 'NEWEDO.skill.meleeHeavy',
        thrown: 'NEWEDO.skill.meleeHeavy'
    },
    ranged: {
        archery: 'NEWEDO.skill.archery',
        smallarms: 'NEWEDO.skill.smallarms',
        gunnery: 'NEWEDO.skill.gunnery',
    }
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