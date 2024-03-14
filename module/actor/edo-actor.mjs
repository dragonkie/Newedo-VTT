import LOGGER from "../utility/logger.mjs";
import systemUtility from "../utility/systemUtility.mjs";
/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class NewedoActor extends Actor {

  /**
   * @override
   * @async
   * @static
   */
  static async create(data, options) {
    const createData = data;
    const newActor = typeof data.system === `undefined`;
    
    if (newActor) {
      LOGGER.debug(`Creating new actor`)
      createData.items = [];
      const coreItems = await systemUtility.getCoreCharDocs();
      coreItems.forEach((item) => {
        const updated = duplicate(item.system);
        const newItem = {
          name: item.name,
          img: item.img,
          type: item.type,
          system: updated
        };
        createData.items.push(newItem);
      })
    }
    const actor = await super.create(createData, options);
    
  }

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
    const actorData = this;
    const system = actorData.system;
    const core = system.traits.core;
    const derived = system.traits.derived;

    // Loop through core traits and calculate their rank
    for (let [key, trait] of Object.entries(core)) {
      if ((typeof trait.value !== `number`) || (trait.value < 1)) trait.value = 10;
      trait.rank = Math.max(Math.floor(trait.value / 10), 0);
    }

    //calculates the base stats for derived values, these will be affected by their mods and multipliers
    //in prepare derived data function
    derived.init.value = Math.ceil(core.ref.value + core.sav.value);
    derived.move.value = Math.ceil(core.ref.value + core.hrt.value);
    derived.def.value = Math.ceil(core.pow.value + core.ref.value);
    derived.res.value = Math.ceil(core.hrt.value + core.pre.value);

    derived.hp.max = core.hrt.value;
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
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    // Make modifications to data here. For example:
    const system = this.system;
    const core = system.traits.core;
    const derived = system.traits.derived;
    const attributes = system.attributes;

    // Loop through core traits and calculate their rank
    for (let [key, trait] of Object.entries(core)) {
      if ((typeof trait.value !== `number`) || (trait.value < 1)) trait.value = 1;
      trait.rank = Math.max(Math.floor(trait.value / 10), 0);
    }

    //calculates ranks for background, idk why it doesnt scale as just 1 rank per 20 points?
    for (let [key, background] of Object.entries(system.background)) {
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
    
    // Calculates derived traits for initative, move, defence, resolve, and max health
    derived.init.value = Math.ceil(derived.init.value * derived.init.mod);
    derived.move.value = Math.ceil((derived.move.value / system.attributes.size.value) * derived.move.mod);
    derived.def.value = Math.ceil(derived.def.value * derived.def.mod);
    derived.res.value = Math.ceil(derived.res.value * derived.res.mod);
    derived.hp.max = Math.ceil(derived.hp.max * derived.hp.mod);

    //calculates characters legend rank
    system.legend.rank = 1;
    if (system.legend.max > 45) system.legend.rank = 2;
    if (system.legend.max > 75) system.legend.rank = 3;
    if (system.legend.max > 110) system.legend.rank = 4;
    if (system.legend.max > 160) system.legend.rank = 5;
    
    //checks the actors wound state
    var hpCheck = derived.hp.value / derived.hp.max * 100;
    if (hpCheck <= 0) derived.hp.wound = `Burning Legend`;
    if (hpCheck <= 10) derived.hp.wound = `Hurt Bad`;
    if (hpCheck <= 25) derived.hp.wound = `Banged Up`;
    if (hpCheck <= 75) derived.hp.wound = `Flesh Wound`;
    if (hpCheck <= 90) derived.hp.wound = `Grazed`;
    if (hpCheck > 90) derived.hp.wound = `Okay`;

    //checks how much noise the character has from augments
    var biofeedback = 0;
    for (let [key, item] of this.items.entries()) {
      if (item.type === `augment`) {
        if (item.system.installed) {
          LOGGER.debug("Found installed augment:", item);
          var rank = item.system.rank;
          var noise = item.system.noise;
          biofeedback += item.system.biofeedback;

          core.pow.noise += noise.pow * rank;
          core.ref.noise += noise.ref * rank;
          core.hrt.noise += noise.hrt * rank;
          core.sav.noise += noise.sav * rank;
          core.per.noise += noise.per * rank;
          core.pre.noise += noise.pre * rank;
        }
      }
    }

    //sets the biofeedback chance based on the value totaled
    const bioFate = this.items.getName(`Biofeedback`);
    LOGGER.debug(`Checking if biofeedback was found`, bioFate);
    if (bioFate) {
      LOGGER.debug(`Updating biofeedback fate`);
      if (biofeedback > 0) bioFate.update({'system.range.min': 4, 'system.range.max': 3+biofeedback});
      else bioFate.update({'system.range.min': 0, 'system.range.max': 0});
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
    if (this.type === 'character') this._getCharacterRollData(data);
    if (this.type === 'npc') this._getNpcRollData(data);

    return data;
  }

  getSkill(skillName) {
    const skills = this.itemTypes.skill;
    for (var skill of skills) {
      if (skill.name === skillName) return skill;
    }
    return undefined;
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