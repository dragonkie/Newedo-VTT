import { Dicetray, Dice } from "../utility/dicetray.js";
import LOGGER from "../utility/logger.mjs";
import systemUtility from "../utility/systemUtility.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class NewedoItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).

    //this function is used to ensure all the item data is properly managed, this 
    //includes making any calculations on creation, update, or when loading the server
    //Any items owned by a character will run this function when the server loads
    //when migrating system data, its possible to use prepareData to help manage and correct values alongside the actual migrateData function

    super.prepareData();
  }

  prepareBaseData() {

  }

  prepareDerivedData() {

    if (this.isOwned) LOGGER.debug(`PREPARE | ITEM | DERIVED | OWNED | ${this.type}`);
    else if (this.isEmbedded) LOGGER.debug(`PREPARE | ITEM | DERIVED | EMBEDDED | ${this.type}`);
    else LOGGER.debug(`PREPARE | ITEM | DERIVED | ${this.type}`);
    //variable to check what type of item this is
    const type = this.type;
    //checks through and calls the prep function based on the item type
    if (type == `weapon`) this._prepareWeapon();
    else if (type == `armour`) {}
    else if (type == `kami`) {}
    else if (type == `rote`) this._prepareRote();
    else if (type == `skill`) this._prepareSkill();
    else if (type == `fate`) this._prepareFate();
  }

  _prepareSkill() {
    let system = this.system;
    let rollData = this.getRollData();

    var skillDice = systemUtility.dicetray(system.ranks);
    var traitDice = ``;

    //sets the base value of the skill roll to use the core trait or not
    if (rollData != null && system.rollTrait != false) {
      traitDice = `${rollData[system.trait].rank}d10`;
    }

    system.formula = traitDice;
    if (skillDice !== ``) system.formula += `+${skillDice}`;
  }

  _prepareFate() {
    //variable to hold the actual range value of the fate roll to trigger
    //checks for and corrects any invalid values
    var range = this.system.range;
    if (range.min > range.max) {
      range.max = range.max^range.min;
      range.min = range.max^range.min;
      range.max = range.max^range.min;
    }
    let val = 0;
    for (const bonus of range.bonuses) {
      val += bonus.value;
    }
    range.max += val;
    range.value = range.max - range.min + 1;

    if (range.max > 100) {
      LOGGER.error(`Fate ${itemData.name} has an out of scope range`);
      range.min -= range.max - 100;
      range.max -= range.max - 100;
    }
  }

  _prepareWeapon() {
    //grabs data structure variables
    let system = this.system;
    let rollData = this.getRollData(); //rolldata holds all the info needed from the parent actors

    //corrects quality values
    if (system.quality.value > system.quality.max) system.quality.value = system.quality.max;
    if (system.quality.value < 1) system.quality.value = 1;
    //corrects grit values
    if (system.grit.value > system.quality.value * 2) system.grit.value = system.quality.value;
    if (system.grit.value < 0) system.grit.value = 0;
    //if the grit modifiers are higher than what the grit allows, lowers them evenly until they are acceptable
    while (system.grit.atk + system.grit.dmg > Math.floor(system.grit.value / 2)) {
      if (system.grit.atk > system.grit.dmg) system.grit.atk -= 1;
      else system.grit.dmg -= 1;
    }

    //clears the formulas to make sure no garbage is in them
    system.attack.formula = "";
    system.damage.formula = "";
    var skill = null

    switch (system.skill) {
      case `Archery`: 
      case `Gunnery`:
      case `Small Arms`:
        system.isRanged = true;
        break;
      default:
        system.isRanged = false;
        break;
    }

    //checks to see if rolldata exists in this instance, if there is no actor present, doesn't trigger
    if (this.parent != null && rollData != null ) {
      skill = this.parent.getSkill(system.skill);
      //ensures that the right skill was found on the actor
      if (skill != null) {
        if (system.isRanged) {
          //adds the perception trait dice to the attack roll
          system.attack.formula += skill.system.formula;
        } else {
          //adds power trait dice to the attack and damage roll
          system.attack.formula += skill.system.formula;
          //adds the power traits dice to the damage
          system.damage.formula += `${rollData.pow.rank}d10`;
        }
        //if there is a grit value for attacks, appen it to the attack formula
        if (system.grit.atk > 0) system.attack.formula += (system.attack.formula === ``) ? `${system.grit.atk}` : (` + ${system.grit.atk}`);
  
        //adds the damage dice to the string, if the string has values in it already it will add in the operators
        system.damage.formula += (system.damage.formula === ``) ? `${system.damage.value}` : (` + ${system.damage.value}`);
        if (system.grit.dmg > 0) system.damage.formula += `+${system.grit.dmg}`;
      }
    }
  }

  _prepareRote() {
    let system = this.system;
    let rollData = this.getRollData(); //rolldata holds all the info needed from the parent actors

    system.formula = "";
    if (this.parent != null && rollData != null) {
      //if the rote is owned by an actor object, calculates the formulas for the rote if it can find them
      var psys = this.parent.system;
      var skill = this.parent.getSkill(system.skill);
      if (skill != null) {
        if (psys.traits.shinpi.rank > 0) system.formula += `${psys.traits.shinpi.rank}`;
        LOGGER.debug(`Roll formula for rote = `, system.formula);
        system.formula += `${skill.system.formula}`;
        LOGGER.debug(`Roll formula for rote = `, system.formula);
      }
    }
  }
  /**
   * Prepare a data object which is passed to any Roll formulas which are related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( this.actor === null ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);
    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
