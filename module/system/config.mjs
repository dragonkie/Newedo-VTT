// Exported object
export const NEWEDO = {};

NEWEDO.traits = {
  core: {
    pow: "NEWEDO.trait.core.pow",
    ref: "NEWEDO.trait.core.ref",
    hrt: "NEWEDO.trait.core.hrt",
    sav: "NEWEDO.trait.core.sav",
    per: "NEWEDO.trait.core.per",
    pre: "NEWEDO.trait.core.pre",
    abbr : {
      pow: "NEWEDO.trait.core.abbr.pow",
      ref: "NEWEDO.trait.core.abbr.ref",
      hrt: "NEWEDO.trait.core.abbr.hrt",
      sav: "NEWEDO.trait.core.abbr.sav",
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
    abbr : {
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
  rank: "NEWEDO.generic.rank"
};

NEWEDO.damage = {
  kin: "NEWEDO.damage.kinetic",
  ele: "NEWEDO.damage.elemental",
  bio: "NEWEDO.damage.biological",
  arc: "NEWEDO.damage.arcane",
  abbr: {
    kin: "NEWEDO.damage.abbr.kinetic",
    ele: "NEWEDO.damage.abbr.elemental",
    bio: "NEWEDO.damage.abbr.biological",
    arc: "NEWEDO.damage.abbr.arcane",
  }
}

NEWEDO.attributes = {
  exp: "NEWEDO.AttributeExp",
  lvl: "NEWEDO.AttributeLvl",
  size: "NEWEDO.AttributesSize",
};
//Sorted A-Z, grouped by trait
NEWEDO.skill = { 
  label: {
    //Heart
    crafting: "NEWEDO.global.skill.label.crafting",
    meditation: "NEWEDO.global.skill.label.meditation",
    rally: "NEWEDO.global.skill.label.rally",
    survival: "NEWEDO.global.skill.label.survival",
    //Power
    athletics: "NEWEDO.global.skill.label.athletics",
    meleeheavy: "NEWEDO.global.skill.label.meleeHeavy",
    meleelight: "NEWEDO.global.skill.label.meleeLight",
    thrown: "NEWEDO.global.skill.label.thrown",
    unarmed: "NEWEDO.global.skill.label.unarmed",
    //Reflex
    banter: "NEWEDO.global.skill.label.banter",
    dodge: "NEWEDO.global.skill.label.dodge",
    drive: "NEWEDO.global.skill.label.drive",
    sleightofhand: "NEWEDO.global.skill.label.sleightOfHand",
    stealth: "NEWEDO.global.skill.label.stealth",
    //Presence
    deception: "NEWEDO.global.skill.label.deception",
    eloquence: "NEWEDO.global.skill.label.eloquence",
    intimidation: "NEWEDO.global.skill.label.intimidation",
    performance: "NEWEDO.global.skill.label.performance",
    seduction: "NEWEDO.global.skill.label.seduction",
    //Perception
    archery: "NEWEDO.global.skill.label.archery",
    commerce: "NEWEDO.global.skill.label.commerce",
    gunnery: "NEWEDO.global.skill.label.gunnery",
    inuition: "NEWEDO.global.skill.label.intuition",
    investigation: "NEWEDO.global.skill.label.investigation",
    smallarms: "NEWEDO.global.skill.label.smallarms",
    //Savvy
    arcana: "NEWEDO.global.skill.label.arcana",
    computers: "NEWEDO.global.skill.label.computers",
    gambling: "NEWEDO.global.skill.label.gambling",
    hardware: "NEWEDO.global.skill.label.hardware",
    medicine: "NEWEDO.global.skill.label.medicine",
    security: "NEWEDO.global.skill.label.security",
    streetwise: "NEWEDO.global.skill.label.streetwise",
    study: "NEWEDO.global.skill.label.study",
    surveillance: "NEWEDO.global.skill.label.surveillance",
    tactics: "NEWEDO.global.skill.label.tactics",
    toxicology: "NEWEDO.global.skill.label.toxicology",
    wetware: "NEWEDO.global.skill.label.wetware",
  },
  description: {
    //Heart
    crafting: "NEWEDO.global.skill.description.crafting",
    meditation: "NEWEDO.global.skill.description.meditation",
    rally: "NEWEDO.global.skill.description.rally",
    survival: "NEWEDO.global.skill.description.survival",
    //Power
    athletics: "NEWEDO.global.skill.description.athletics",
    meleeheavy: "NEWEDO.global.skill.description.meleeHeavy",
    meleelight: "NEWEDO.global.skill.description.meleeLight",
    thrown: "NEWEDO.global.skill.description.thrown",
    unarmed: "NEWEDO.global.skill.description.unarmed",
    //Reflex
    banter: "NEWEDO.global.skill.description.banter",
    dodge: "NEWEDO.global.skill.description.dodge",
    drive: "NEWEDO.global.skill.description.drive",
    sleightofhand: "NEWEDO.global.skill.description.sleightOfHand",
    stealth: "NEWEDO.global.skill.description.stealth",
    //Presence
    deception: "NEWEDO.global.skill.description.deception",
    eloquence: "NEWEDO.global.skill.description.eloquence",
    intimidation: "NEWEDO.global.skill.description.intimidation",
    performance: "NEWEDO.global.skill.description.performance",
    seduction: "NEWEDO.global.skill.description.seduction",
    //Perception
    archery: "NEWEDO.global.skill.description.archery",
    commerce: "NEWEDO.global.skill.description.commerce",
    gunnery: "NEWEDO.global.skill.description.gunnery",
    inuition: "NEWEDO.global.skill.description.intuition",
    investigation: "NEWEDO.global.skill.description.investigation",
    smallarms: "NEWEDO.global.skill.description.smallarms",
    //Savvy
    arcana: "NEWEDO.global.skill.description.arcana",
    computers: "NEWEDO.global.skill.description.computers",
    gambling: "NEWEDO.global.skill.description.gambling",
    hardware: "NEWEDO.global.skill.description.hardware",
    medicine: "NEWEDO.global.skill.description.medicine",
    security: "NEWEDO.global.skill.description.security",
    streetwise: "NEWEDO.global.skill.description.streetwise",
    study: "NEWEDO.global.skill.description.study",
    surveillance: "NEWEDO.global.skill.description.surveillance",
    tactics: "NEWEDO.global.skill.description.tactics",
    toxicology: "NEWEDO.global.skill.description.toxicology",
    wetware: "NEWEDO.global.skill.description.wetware",
  }
};

NEWEDO.sheet = {
  tab : {// Navigation tabs
    trait: "NEWEDO.sheet.nav.trait",
    skill: "NEWEDO.sheet.nav.skill",
    fate: "NEWEDO.sheet.nav.fate",
    item: "NEWEDO.sheet.nav.item",
    magic: "NEWEDO.sheet.nav.magic",
    biography: "NEWEDO.sheet.nav.biography"
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
  item : {
    skill: "TYPES.item.skill",
    weapon: "TYPES.item.weapon"
  },
  actor : {
    character: "TYPES.actor.character"
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