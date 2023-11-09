/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class NewedoActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
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
    console.log("NEWEDO | Preparing character data...")

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    const coreData = systemData.traits.core;
    const deriData = systemData.traits.derived;
    const fateData = systemData.fatecard;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, trait] of Object.entries(systemData.traits.core)) {
      // Calculate the rank of the core traits
      trait.rank = Math.max(Math.floor(trait.value / 10), 1);
    }

    //checks to make sure skill values are valid otherwise sets them to 0

    for (let [key, skill] of Object.entries(systemData.skills)) {
      //vars to hold data about the roll formula
      let _rollFormula = "";
      let _core = "";

      //sets the base value of the skill roll to use the core trait or not
      if (skill.rollCore) _rollFormula += coreData[skill.trait].rank+"d10";

      //loops through skill ranks to validate their values and add them to the roll formula
      for (let [scores, index] of Object.entries(skill.rank)) {
        const element = systemData.skills[key].rank[scores];
        if (element > 0) {
          _rollFormula += " + 1d" + element;
        }
      }
      //calculates the roll formula for the skil
      systemData.skills[key].formula = _rollFormula;
    }
    
    // Calculates derived traits for initative, move, defence, and resolve
    deriData.initative.value = Math.ceil((coreData.ref.value + coreData.sav.value) * deriData.initative.mod);
    deriData.move.value = Math.ceil(((coreData.ref.value + coreData.hrt.value) / systemData.attributes.size.value) * deriData.move.mod);
    deriData.defence.value = Math.ceil((coreData.pow.value + coreData.ref.value) * deriData.defence.mod);
    deriData.resolve.value = Math.ceil((coreData.hrt.value + coreData.pre.value) * deriData.resolve.mod);

    systemData.health.max = Math.ceil(systemData.health.mod * coreData.hrt.value);
    systemData.health.rest.value = Math.floor(systemData.health.rest.mod * 5.0);

    //Fate card managment
    for (let [key, fate] of Object.entries(fateData.list)) {
      console.log(fate.range.top);
      console.log(fate.range.bot);
      if (fate.range.top < fate.range.bot) {
        console.log("NEWEDO | Fate entry has inverted range, correcting...")
        _t = fate.range.top;
        _b = fate.range.bot;
        _path = "system.fatecard.list."+key+".range";
        console.log(_path);
        actorData.update({[_path + ".top"] : [_t]});
        actorData.update({[_path + ".bot"] : [_b]});
      }
    }
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
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  setSkillValue(key, value) {

  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;
    /*
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
    */

    // Add level for easier access, or fall back to 0.
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }
}