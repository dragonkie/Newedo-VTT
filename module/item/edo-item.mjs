import LOGGER from "../utility/logger.mjs";
import sysUtil from "../utility/sysUtil.mjs";

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
    //variable to check what type of item this is
    const type = this.type;
    //checks through and calls the prep function based on the item type
    if (type == `weapon`) this._prepareWeapon();
    else if (type == `armour`) {}
    else if (type == `kami`) {}
    else if (type == `rote`) this._prepareRote();
    else if (type == `fate`) this._prepareFate();
  }

  /* ----------------------------------- Item prep functions ---------------------------------------------- */

  _prepareFate() {
    //variable to hold the actual range value of the fate roll to trigger, checks for and corrects any invalid values
    
  }

  _prepareWeapon() {
    
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
        system.formula += `${skill.system.formula}`;
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
