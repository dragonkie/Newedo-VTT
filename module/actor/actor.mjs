import LOGGER from "../utility/logger.mjs";
/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class NewedoActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects), prepareDerivedData();
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const flags = actorData.flags.newedo || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;
    LOGGER.log("Preparing character data")

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    const coreData = systemData.traits.core;
    const deriData = systemData.traits.derived;
    const fateData = systemData.fatecard;

    // Loop through core traits and calculate their rank
    for (let [key, trait] of Object.entries(coreData)) {
      if ((typeof trait.value !== `number`) || (trait.value < 1)) trait.value = 10;
      trait.rank = Math.max(Math.floor(trait.value / 10), 1);
    }

    //calculates ranks for background, idk why it doesnt scale as just 1 rank per 20 points?
    for (let [key, background] of Object.entries(systemData.background)) {
      if (background.value < 1) background.value = 1;

      background.rank = 1;
      if (background.value >= 91) background.rank = 5;
      else if (background.value >= 66) background.rank = 4;
      else if (background.value >= 31) background.rank = 3;
      else if (background.value >= 11) background.rank = 2;
      //ensures background cant be above 100, or below 1
      if (background.value > 100) background.value = 100;
      if (background.value < 1) background.value = 1;
    }

    //goes through list of skills and calculates the roll formula for them
    for (let [key, skill] of Object.entries(systemData.skills)) {
      //vars to hold data about the roll formula
      let _rollFormula = "";
      //sets the base value of the skill roll to use the core trait or not
      if (skill.rollCore) _rollFormula += coreData[skill.trait].rank+"d10x10";
      /*loops through skill ranks to validate their values and add them to the roll formula
      * array template [d4, d6, d8, d12]
      */ 
      LOGGER.debug("Caluclating skill dice formula")
      let diceTray = [0, 0, 0, 0];
      for (let [key, value] of Object.entries(skill.rank)) {
        switch (value) {
          case 4:
            diceTray[0] += 1;
            break;
          case 6:
            diceTray[1] += 1;
            break;
          case 8:
            diceTray[2] += 1;
            break;
          case 12:
            diceTray[3] += 1;
            break;
        }
      }

      if (diceTray[0] != 0) _rollFormula += `+${diceTray[0]}d4`;
      if (diceTray[1] != 0) _rollFormula += `+${diceTray[1]}d6`;
      if (diceTray[2] != 0) _rollFormula += `+${diceTray[2]}d8`;
      if (diceTray[3] != 0) _rollFormula += `+${diceTray[3]}d12`;

      systemData.skills[key].formula = _rollFormula;
    }
    
    // Calculates derived traits for initative, move, defence, resolve, and max health
    deriData.init.value = Math.ceil((coreData.ref.value + coreData.sav.value) * deriData.init.mod);
    deriData.move.value = Math.ceil(((coreData.ref.value + coreData.hrt.value) / systemData.attributes.size.value) * deriData.move.mod);
    deriData.def.value = Math.ceil((coreData.pow.value + coreData.ref.value) * deriData.def.mod);
    deriData.res.value = Math.ceil((coreData.hrt.value + coreData.pre.value) * deriData.res.mod);
    systemData.health.max = Math.ceil(systemData.health.mod * coreData.hrt.value);
    systemData.health.rest.value = Math.floor(systemData.health.rest.mod * 5.0);

    //ensure fatecard is well organized
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    if (this.type === 'character') this._getCharacterRollData(data);
    if (this.type === 'npc') this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    // Copy the ability scores to the top level, so that rolls can use functions like /r 1d20+@dex
    if (data.traits.core) {
      for (let [k, v] of Object.entries(data.traits.core)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    // Copys derived traits which are made of other stats combined
    if (data.traits.derived) {
      for (let [k, v] of Object.entries(data.traits.derived)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    

    // Process additional NPC data here.
  }
}