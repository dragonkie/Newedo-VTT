import {onManageActiveEffect, prepareActiveEffectCategories} from "../../helpers/effects.mjs";
import LOGGER from "../../utility/logger.mjs";
import systemUtility from "../../utility/systemUtility.mjs";

import { Dice, Dicetray} from "../../utility/dicetray.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class NewedoActorSheet extends ActorSheet {

  //control variables and static macros for them
  static MODES = {
    PLAY: 1,
    EDIT: 2,
  }
  _mode = this.constructor.MODES.PLAY;
  _editable = true;

  /** @override */
  static get defaultOptions() {
    var merged = mergeObject(super.defaultOptions, {
      classes: ["newedo", "sheet", "actor"],
      template: `systems/${game.system.id}/templates/actor/actor-sheet.html`,
      width: 800,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "traits", group: "primary"}]
    });
    return merged
  }

  /** @override */
  get template() {
    return `systems/${game.system.id}/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* --------------------------------------------- Render functions --------------------------------------------- */
  /** @inheritDoc */
  async _render(force=false, options={}) {
    await super._render(force, options);
  }
  
  /** @inheritDoc */
  async _renderOuter() {
    const html = await super._renderOuter();
    const header = await html[0].querySelector(".window-header");
    
    //injects the edit toggle button into the top left corner of the character header
    if (this.isEditable) {
      const toggle = document.createElement("a");
      toggle.classList.add("switch");
      toggle.setAttribute("mode", this._mode);

      /*
      const clicker = document.createElement("input");
      clicker.type = "checkbox";
      clicker.checked = (this._mode === this.constructor.MODES.PLAY);
      */

      const thumb = document.createElement("span");
      thumb.classList.add("slider", "round");
      
      toggle.addEventListener("click", function(event) {
        const toggle = event.currentTarget
        const value = toggle.getAttribute("mode");

        if (value === "1") {
          this._mode = 2;
        } else if (value === "2") this._mode = 1;

        toggle.setAttribute("mode", this._mode);
        this.submit();
      }.bind(this));

      toggle.appendChild(thumb);

      header.insertAdjacentElement("afterbegin", toggle);
    }
    return html;
  }

  async _renderInner(...args) {
    const html = await super._renderInner(...args);
    return html;
  }

  /* ----------------------------------------------------------------------------------  ---------------------------------------------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.items = actorData.items;
    context.editable = this.isEditable && (this._mode === this.constructor.MODES.EDIT);

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    /*/ Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }
    */

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);
    LOGGER.debug(`ACTOR | SHEET | GETDATA`, context);
    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    LOGGER.debug(`PREPARE | ACTOR | CHARACTER`);

    //constants to hold references to the diffrent trait links
    const { core, derived } = context.system.traits;

    //core traits
    for (let [k, v] of Object.entries(core)) {
      v.label = systemUtility.Localize(CONFIG.NEWEDO.traits.core[k]) ?? k;
      v.abr = systemUtility.Localize(CONFIG.NEWEDO.traits.coreAbbreviations[k]) ?? k;
    }
    // Derived traits.
    for (let [k, v] of Object.entries(derived)) {
      v.label = systemUtility.Localize(CONFIG.NEWEDO.traits.derived[k]) ?? k;
      v.abr = systemUtility.Localize(CONFIG.NEWEDO.traits.derivedAbbreviations[k]) ?? k;
    }
    //localize armour labels
    for (let [k, v] of Object.entries(context.system.attributes.armour)) {
      v.label = systemUtility.Localize(CONFIG.NEWEDO.damageTypes[k]) ?? k;
    }

    for (let [k, v] of Object.entries(context.system.background)) {
      v.label = systemUtility.Localize(CONFIG.NEWEDO.backgrounds[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const weapons = [];
    const armour = [];
    const ammo = [];
    const augments = [];
    const features = [];
    const fates = [];
    const kami = [];
    const rotes = [];
    const skills = {
      pow : [],
      ref : [],
      hrt : [],
      pre : [],
      sav : [],
      per : []
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'weapon') weapons.push(i);
      else if (i.type === `armour`) armour.push(i);
      else if (i.type === `ammo`) ammo.push(i);
      else if (i.type === `augment`) augments.push(i);
      else if (i.type === 'feature') features.push(i);
      else if (i.type === `fate`) fates.push(i);
      else if (i.type === `kami`) kami.push(i);
      else if (i.type === `rote`) rotes.push(i);
      else if (i.type === `skill`) {
        if (i.system.trait === `pow`) skills.pow.push(i);
        else if (i.system.trait === `ref`) skills.ref.push(i);
        else if (i.system.trait === `hrt`) skills.hrt.push(i);
        else if (i.system.trait === `pre`) skills.pre.push(i);
        else if (i.system.trait === `sav`) skills.sav.push(i);
        else if (i.system.trait === `per`) skills.per.push(i);
      }
    }

    // Assign and return
    context.weapons = weapons;
    context.armour = armour;
    context.ammo = ammo;
    context.augments = augments;
    context.features = features;
    context.fates = fates;
    context.kami = kami;
    context.rotes = rotes;
    context.skills = skills;

    //organize fates list by their range
    function fateCompare(a, b) {
      if ( a.system.range.max > b.system.range.max ){
        return -1;
      }
      if ( a.system.range.max < b.system.range.max ){
        return 1;
      }
      return 0;
    }

    fates.sort(fateCompare);
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("item-id"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    /* ------------------------ UI interaction ------------------------ */


    /* ------------------------ Roll Managment ------------------------ */
    // Rollable traits.
    html.find('.rollable').click(this._onRoll.bind(this));
    //Skill rollable links
    html.find('.skill-rollable').each ((i, li) => {
      let handler = ev => this._rollSkill(ev);
      li.addEventListener("click", handler);
      li.addEventListener("contextmenu", handler);
    });
    //fate dice roll clicks
    html.find('.fate-roll').each ((i, li) => {
      let handler = ev => this._rollFate(ev);
      li.addEventListener("click", handler);
    });
    /* --------------------- Embedded item controls --------------------- */
    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));
    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });
    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
    //Skill dice button Cycler
    html.find('.skill-dice-button').each ((i, li) => {
      let handler = ev => this._cycleSkillDice(ev);
      li.addEventListener("click", handler);
      li.addEventListener("contextmenu", handler);
    });
  }

  /**
   * Handles the cycling of skill dice with button presses
   * @param {Event} event the originating click event
   * @private
   */
  async _cycleSkillDice(event) {
    event.preventDefault();
    const element = event.currentTarget;

    const _id = element.closest('.item').dataset.itemId;
    const _index = element.dataset.index;
    const item = this.actor.items.get(_id);
    const type = event.type;

    //copies the ranks from the item as the whole array is overriden when Document#update(); is called
    var ranks = foundry.utils.deepClone(item.system.ranks);
    
    if (type === `click`){
      switch (ranks[_index]) {
        case 0:
          ranks[_index] = 4;
          break;
        case 4:
          ranks[_index] = 6;
          break;
        case 6:
          ranks[_index] = 8;
          break;
        case 8:
          ranks[_index] = 12;
          break;
        default:
          ranks[_index] = 0;
          break;
      }
    } else if (type === `contextmenu`) {
      switch (ranks[_index]) {
        case 0:
          ranks[_index] = 12;
          break;
        case 4:
          ranks[_index] = 0;
          break;
        case 6:
          ranks[_index] = 4;
          break;
        case 8:
          ranks[_index] = 6;
          break;
        case 12:
          ranks[_index] = 8;
          break;
        default:
          ranks[_index] = 0;
          break;
      }
    }
    //scheme for the updated skil lranks to be sent to the item
    const updateData = {
      system: {
        ranks: ranks
      }
    }
    LOGGER.debug(`Updating skill dice item`, await item.update(updateData));
  };

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }
  /* ----------------------------------------------- ROLL FUNCTIONS --------------------------------------------------------------- */
  ///Roll functions, a general roll is called, which then specifies the specific roll type to use
  async _onRoll(event) {
    event.preventDefault();

    const context = {};
    context.event = event;
    context.actor = this.actor;
    context.item = (event.currentTarget.closest('.item') !== null) ? this.actor.items.get(event.currentTarget.closest('.item').dataset.itemId) : null;

    if (context.item !== null) {
      //if this is an item roll
      LOGGER.debug(`Rolling with item:`, context.item);
      switch (context.item.type) {
        case `skill`:
          this._rollSkill(context);
          break;
        default: 
          this._rollStandard(event);
          break;
      }
    } else {
      //if this is any other kind of roll
      LOGGER.debug(`Standard roll`);
      this._rollStandard(event);
    }
  }

  async _rollSkill(context) {

    const event = context.event
    const actor = context.actor;

    //defines a skill object to keep things organized
    const skill = {};
    skill.item = context.item;
    skill.system = context.item.system;
    skill.formula = ``;
    skill.ranks = systemUtility.dicetray(skill.system.ranks);
    skill.trait = actor.system.traits.core[skill.system.trait].rank;

    //rolls with advantage, adding 1d10 to the pool
    var skillDice = new Dicetray();

    if (event.type === `contextmenu`) skill.trait = 0;//sets the d10's to 0, removing all trait dice if the skill shouldnt be rolled with them
    if (event.shiftKey && !eventType.ctrlKey) skill.trait += 1;//adds 1d10 to the pool if rolling with advantage

    skillDice.add(skill.system.ranks);//adds the array of skill dice to the pool
    //checks if the roll should have disadvantage
    if (event.ctrlKey && !event.shiftKey) {
      if (skill.trait > 0) skill.trait -= 1; //if the skill trait is greater than 0, meaning there are d10's, drops a d10 from the list
      else skillDice.dropHighest(1); //if there are no d10's, drops one of the largest dice available
    }

    if (skill.trait > 0) skillDice.tray.unshift(new Dice(10, skill.trait, `x10`));//adds the d10's from traits and advantage, and adds the explode modifier to them
    skillDice.clean();//cleans up any empty entries in the dice tray
    
    skill.formula = skillDice.formula;

    //Creates the final roll formula from all the given values
    if (skill.formula === ``) return 0; //catches if the roll ended up empty, resulting in an impossible roll
    else {
      let roll = new Roll(skill.formula);
      await roll.evaluate();//actually rolls the dice
      let rollRender = await roll.render();//gets the default roll html to render
      let msg = await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor}),
        flavor: "<div style=\"font-size: 18px; text-align: left;\">Skill: "+[skill.item.name],
        content: [rollRender],
        create: true,
        rollMode: game.settings.get('core', 'rollMode')
      });
    }
  }
  /**Handle fate roll table calls
   * Managed seperately from the standard roll function to maintain simplicity
   * @param {Event} event The originating click event
   * @private
   */
  async _rollFate(event) {
    LOGGER.debug(`Rolling for fate`);
    let roll = new Roll("1d100");
    await roll.evaluate();
    const result = roll.total;

    console.log(roll);

    var label = "";
    var description = "";
    //This function gets the HTML string used to display a standard roll
    var rollRender = await roll.render();

    const context = this.getData();

    for (let [key, fate] of Object.entries(context.fates)) {
      var _bot = fate.system.range.min;
      var _top = fate.system.range.max;
      //checks that the roll result is in range, regardless if the start and end of the range are configured properly
      if ((result >= Math.min(_bot, _top)) && (result <= Math.max(_bot, _top))) {
        label = " | " + fate.name;
        description = fate.system.description;
      }
    }
    //creates the role message, adding in the description and fate title if one was rolled
    //The description is enrichedHTML and can have inlineroles and UUID links
    let msg = await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor}),
      flavor: "<div style=\"font-size: 20px; text-align: center;\">Fate"+[label],
      content: [rollRender]+"<div>"+[description]+"</div>",
      create: true,
      rollMode: game.settings.get('core', 'rollMode')
    });
  }

  /**
   * Handle clickable roll events.
   * @param {Event} event   The originating click event
   * @private
   */
  _rollStandard(event) {
    LOGGER.log(`Caught undefined roll type`)
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}