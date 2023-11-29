// Exported object
const NEWEDO = {}

NEWEDO.traits = {
  core: {
    pow: "NEWEDO.TraitPow",
    ref: "NEWEDO.TraitRef",
    hrt: "NEWEDO.TraitHrt",
    sav: "NEWEDO.TraitSav",
    per: "NEWEDO.TraitPer",
    pre: "NEWEDO.TraitPre"
  },
  coreAbbreviations: {
    pow: "NEWEDO.TraitPowAbbr",
    ref: "NEWEDO.TraitRefAbbr",
    hrt: "NEWEDO.TraitHrtAbbr",
    sav: "NEWEDO.TraitSavAbbr",
    per: "NEWEDO.TraitPerAbbr",
    pre: "NEWEDO.TraitPreAbbr"
  },
  derived: {
    init: "NEWEDO.TraitInit",
    move: "NEWEDO.TraitMove",
    def: "NEWEDO.TraitDef",
    res: "NEWEDO.TraitRes"
  },
  derivedAbbreviations: {
    init: "NEWEDO.TraitInitAbbr",
    move: "NEWEDO.TraitMoveAbbr",
    def: "NEWEDO.TraitDefAbbr",
    res: "NEWEDO.TraitResAbbr"
  }
}

NEWEDO.attributes = {
  exp: "NEWEDO.AttributeExp",
  lvl: "NEWEDO.AttributeLvl",
  size: "NEWEDO.AttributesSize",
  armour: {
    kin: "NEWEDO.SoakKinetic",
    ele: "NEWEDO.SoakElemental",
    bio: "NEWEDO.SoakBiological",
    arc: "NEWEDO.SoakArcane"
  }
}
//Sorted A-Z, grouped by trait
NEWEDO.skills = {
  //Heart
  crafting: "NEWEDO.SkillCrafting",
  meditation: "NEWEDO.SkillMeditation",
  rally: "NEWEDO.SkillRally",
  survival: "NEWEDO.SkillSurvival",
  //Power
  athletics: "NEWEDO.SkillAthletics",
  meleeHeavy: "NEWEDO.SkillMeleeHeavy",
  meleeLight: "NEWEDO.SkillMeleeLight",
  thrown: "NEWEDO.SkillThrown",
  unarmed: "NEWEDO.SkillUnarmed",
  //Reflex
  banter: "NEWEDO.SkillBanter",
  dodge: "NEWEDO.SkillDodge",
  drive: "NEWEDO.SkillDrive",
  sleightOfHand: "NEWEDO.SkillSleightOfHand",
  stealth: "NEWEDO.SkillStealth",
  //Presence
  deception: "NEWEDO.SkillDeception",
  eloquence: "NEWEDO.SkillEloquence",
  intimidation: "NEWEDO.SkillIntimidation",
  performance: "NEWEDO.SkillPerformance",
  seduction: "NEWEDO.SkillSeduction",
  //Perception
  archery: "NEWEDO.SkillArchery",
  commerce: "NEWEDO.SkillCommerce",
  gunnery: "NEWEDO.SkillGunnery",
  inuition: "NEWEDO.SkillIntuition",
  investigation: "NEWEDO.SkillInvestigation",
  smallArms: "NEWEDO.SkillSmallArms",
  //Savvy
  arcana: "NEWEDO.SkillArcana",
  computers: "NEWEDO.SkillComputers",
  gambling: "NEWEDO.SkillGambling",
  hardware: "NEWEDO.SkillHardware",
  medicine: "NEWEDO.SkillMedicine",
  security: "NEWEDO.SkillSecurity",
  streetwise: "NEWEDO.SkillStreetwise",
  study: "NEWEDO.SkillStudy",
  surveillance: "NEWEDO.SkillSurveillance",
  tactics: "NEWEDO.SkillTactics",
  toxicology: "NEWEDO.SkillToxicology",
  wetware: "NEWEDO.SkillWetware"
}

NEWEDO.backgrounds = {
  contacts: "NEWEDO.bgContacts",
  followers: "NEWEDO.bgFollowers",
  soul: "NEWEDO.bgSoul",
  status: "NEWEDO.bgStatus",
  wealth: "NEWEDO.bgWealth"
}

NEWEDO.sheets = {
  actor: {
    character: "TYPES.Actor.character",
    npc: "TYPES.Actor.npc",
    pet: "TYPES.Actor.pet",
    vehicle: "TYPES.Actor.vehicle"
  },
  item: {
    weapon: "TYPES.Item.weapon",
    armour: "TYPES.Item.armour",
    augment: "TYPES.Item.augment"
  },
  card: {

  },
  page: {

  }
}

export default NEWEDO;