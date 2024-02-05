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
  },
  coreAbbreviations: {
    pow: "NEWEDO.trait.core.abbr.pow",
    ref: "NEWEDO.trait.core.abbr.ref",
    hrt: "NEWEDO.trait.core.abbr.hrt",
    sav: "NEWEDO.trait.core.abbr.sav",
    per: "NEWEDO.trait.core.abbr.per",
    pre: "NEWEDO.trait.core.abbr.pre",
  },
  derived: {
    init: "NEWEDO.trait.derived.init",
    move: "NEWEDO.trait.derived.move",
    def: "NEWEDO.trait.derived.def",
    res: "NEWEDO.trait.derived.res",
  },
  derivedAbbreviations: {
    init: "NEWEDO.trait.derived.abbr.init",
    move: "NEWEDO.trait.derived.abbr.move",
    def: "NEWEDO.trait.derived.abbr.def",
    res: "NEWEDO.trait.derived.abbr.res",
  },
};

NEWEDO.generic = {
  health: "NEWEDO.generic.health",
  legend: "NEWEDO.generic.legend",
  damage: "NEWEDO.generic.damage",
};

NEWEDO.damageTypes = {
  kin: "NEWEDO.global.damage.kinetic",
  ele: "NEWEDO.global.damage.elemental",
  bio: "NEWEDO.global.damage.biological",
  arc: "NEWEDO.global.damage.arcane",
};

NEWEDO.attributes = {
  exp: "NEWEDO.AttributeExp",
  lvl: "NEWEDO.AttributeLvl",
  size: "NEWEDO.AttributesSize",
};
//Sorted A-Z, grouped by trait
NEWEDO.skillList = {
  //Heart
  crafting: "NEWEDO.global.itemType.skill.crafting",
  meditation: "NEWEDO.global.itemType.skill.meditation",
  rally: "NEWEDO.global.itemType.skill.rally",
  survival: "NEWEDO.global.itemType.skill.survival",
  //Power
  athletics: "NEWEDO.global.itemType.skill.athletics",
  meleeHeavy: "NEWEDO.global.itemType.skill.meleeHeavy",
  meleeLight: "NEWEDO.global.itemType.skill.meleeLight",
  thrown: "NEWEDO.global.itemType.skill.thrown",
  unarmed: "NEWEDO.global.itemType.skill.unarmed",
  //Reflex
  banter: "NEWEDO.global.itemType.skill.banter",
  dodge: "NEWEDO.global.itemType.skill.dodge",
  drive: "NEWEDO.global.itemType.skill.drive",
  sleightOfHand: "NEWEDO.global.itemType.skill.sleightOfHand",
  stealth: "NEWEDO.global.itemType.skill.stealth",
  //Presence
  deception: "NEWEDO.global.itemType.skill.deception",
  eloquence: "NEWEDO.global.itemType.skill.eloquence",
  intimidation: "NEWEDO.global.itemType.skill.intimidation",
  performance: "NEWEDO.global.itemType.skill.performance",
  seduction: "NEWEDO.global.itemType.skill.seduction",
  //Perception
  archery: "NEWEDO.global.itemType.skill.archery",
  commerce: "NEWEDO.global.itemType.skill.commerce",
  gunnery: "NEWEDO.global.itemType.skill.gunnery",
  inuition: "NEWEDO.global.itemType.skill.intuition",
  investigation: "NEWEDO.global.itemType.skill.investigation",
  smallArms: "NEWEDO.global.itemType.skill.smallarms",
  //Savvy
  arcana: "NEWEDO.global.itemType.skill.arcana",
  computers: "NEWEDO.global.itemType.skill.computers",
  gambling: "NEWEDO.global.itemType.skill.gambling",
  hardware: "NEWEDO.global.itemType.skill.hardware",
  medicine: "NEWEDO.global.itemType.skill.medicine",
  security: "NEWEDO.global.itemType.skill.security",
  streetwise: "NEWEDO.global.itemType.skill.streetwise",
  study: "NEWEDO.global.itemType.skill.study",
  surveillance: "NEWEDO.global.itemType.skill.surveillance",
  tactics: "NEWEDO.global.itemType.skill.tactics",
  toxicology: "NEWEDO.global.itemType.skill.toxicology",
  wetware: "NEWEDO.global.itemType.skill.wetware",
};

NEWEDO.backgrounds = {
  contacts: "NEWEDO.global.bg.contacts",
  followers: "NEWEDO.global.bg.followers",
  status: "NEWEDO.global.bg.status",
  wealth: "NEWEDO.global.bg.wealth",
  soul: "NEWEDO.global.bg.soul",
};

NEWEDO.sheets = {
  actor: {
    character: "TYPES.Actor.character",
    vehicle: "TYPES.Actor.vehicle",
    npc: "TYPES.Actor.npc",
    pet: "TYPES.Actor.pet",
  },
  item: {
    weapon: "TYPES.Item.weapon",
    armour: "TYPES.Item.armour",
    augment: "TYPES.Item.augment",
  },
  card: {},
  page: {},
};