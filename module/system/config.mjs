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
    abbr : {
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
  rank: "NEWEDO.generic.rank",
  armour: "NEWEDO.generic.armour",
  soak: "NEWEDO.generic.soak",
};

NEWEDO.wound = {
  healthy : "NEWEDO.wound.healthy",
  grazed : "NEWEDO.wound.grazed",
  wounded : "NEWEDO.wound.wounded",
  bloody : "NEWEDO.wound.bloody",
  beaten : "NEWEDO.wound.beaten",
  burning : "NEWEDO.wound.burning",
}

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

NEWEDO.attribute = {
  exp: "NEWEDO.attribute.exp",
  lvl: "NEWEDO.attribute.lvl",
  size: "NEWEDO.attribute.size",
};
//Sorted A-Z, grouped by trait
NEWEDO.skill = { 
  label: {
    //Heart
    crafting: "NEWEDO.skill.label.crafting",
    meditation: "NEWEDO.skill.label.meditation",
    rally: "NEWEDO.skill.label.rally",
    survival: "NEWEDO.skill.label.survival",
    //Power
    athletics: "NEWEDO.skill.label.athletics",
    meleeheavy: "NEWEDO.skill.label.meleeHeavy",
    meleelight: "NEWEDO.skill.label.meleeLight",
    thrown: "NEWEDO.skill.label.thrown",
    unarmed: "NEWEDO.skill.label.unarmed",
    //Reflex
    banter: "NEWEDO.skill.label.banter",
    dodge: "NEWEDO.skill.label.dodge",
    drive: "NEWEDO.skill.label.drive",
    sleightofhand: "NEWEDO.skill.label.sleightOfHand",
    stealth: "NEWEDO.skill.label.stealth",
    //Presence
    deception: "NEWEDO.skill.label.deception",
    eloquence: "NEWEDO.skill.label.eloquence",
    intimidation: "NEWEDO.skill.label.intimidation",
    performance: "NEWEDO.skill.label.performance",
    seduction: "NEWEDO.skill.label.seduction",
    //Perception
    archery: "NEWEDO.skill.label.archery",
    commerce: "NEWEDO.skill.label.commerce",
    gunnery: "NEWEDO.skill.label.gunnery",
    inuition: "NEWEDO.skill.label.intuition",
    investigation: "NEWEDO.skill.label.investigation",
    smallarms: "NEWEDO.skill.label.smallarms",
    //Savvy
    arcana: "NEWEDO.skill.label.arcana",
    computers: "NEWEDO.skill.label.computers",
    gambling: "NEWEDO.skill.label.gambling",
    hardware: "NEWEDO.skill.label.hardware",
    medicine: "NEWEDO.skill.label.medicine",
    security: "NEWEDO.skill.label.security",
    streetwise: "NEWEDO.skill.label.streetwise",
    study: "NEWEDO.skill.label.study",
    surveillance: "NEWEDO.skill.label.surveillance",
    tactics: "NEWEDO.skill.label.tactics",
    toxicology: "NEWEDO.skill.label.toxicology",
    wetware: "NEWEDO.skill.label.wetware",
  },
  description: {
    //Heart
    crafting: "NEWEDO.skill.description.crafting",
    meditation: "NEWEDO.skill.description.meditation",
    rally: "NEWEDO.skill.description.rally",
    survival: "NEWEDO.skill.description.survival",
    //Power
    athletics: "NEWEDO.skill.description.athletics",
    meleeheavy: "NEWEDO.skill.description.meleeHeavy",
    meleelight: "NEWEDO.skill.description.meleeLight",
    thrown: "NEWEDO.skill.description.thrown",
    unarmed: "NEWEDO.skill.description.unarmed",
    //Reflex
    banter: "NEWEDO.skill.description.banter",
    dodge: "NEWEDO.skill.description.dodge",
    drive: "NEWEDO.skill.description.drive",
    sleightofhand: "NEWEDO.skill.description.sleightOfHand",
    stealth: "NEWEDO.skill.description.stealth",
    //Presence
    deception: "NEWEDO.skill.description.deception",
    eloquence: "NEWEDO.skill.description.eloquence",
    intimidation: "NEWEDO.skill.description.intimidation",
    performance: "NEWEDO.skill.description.performance",
    seduction: "NEWEDO.skill.description.seduction",
    //Perception
    archery: "NEWEDO.skill.description.archery",
    commerce: "NEWEDO.skill.description.commerce",
    gunnery: "NEWEDO.skill.description.gunnery",
    inuition: "NEWEDO.skill.description.intuition",
    investigation: "NEWEDO.skill.description.investigation",
    smallarms: "NEWEDO.skill.description.smallarms",
    //Savvy
    arcana: "NEWEDO.skill.description.arcana",
    computers: "NEWEDO.skill.description.computers",
    gambling: "NEWEDO.skill.description.gambling",
    hardware: "NEWEDO.skill.description.hardware",
    medicine: "NEWEDO.skill.description.medicine",
    security: "NEWEDO.skill.description.security",
    streetwise: "NEWEDO.skill.description.streetwise",
    study: "NEWEDO.skill.description.study",
    surveillance: "NEWEDO.skill.description.surveillance",
    tactics: "NEWEDO.skill.description.tactics",
    toxicology: "NEWEDO.skill.description.toxicology",
    wetware: "NEWEDO.skill.description.wetware",
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