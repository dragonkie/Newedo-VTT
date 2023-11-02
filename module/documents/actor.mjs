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
    const systemData = actorData.system;
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

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    const coreData = systemData.traits.core;
    const deriData = systemData.traits.derived;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, trait] of Object.entries(systemData.traits.core)) {
      // Calculate the rank of the core traits
      trait.rank = Math.max(Math.floor(trait.value / 10), 1);
    }
    
    // Calculates derived traits for initative, move, defence, and resolve
    deriData.initative.value = Math.floor((coreData.ref.value + coreData.sav.value) * deriData.initative.mod);
    deriData.move.value = Math.floor(((coreData.ref.value + coreData.hrt.value) / systemData.size.value) * deriData.move.mod);
    deriData.defence.value = Math.floor((coreData.pow.value + coreData.ref.value) * deriData.defence.mod);
    deriData.resolve.value = Math.floor((coreData.hrt.value + coreData.pre.value) * deriData.resolve.mod);
    systemData.health.max = Math.floor(systemData.health.mod * coreData.hrt.value);
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

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;
    /*
    // Copy the ability scores to the top level, so that rolls can use
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
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 1;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}