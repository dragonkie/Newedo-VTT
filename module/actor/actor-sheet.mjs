import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import LOGGER from "../utility/logger.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class NewedoActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    var merged = mergeObject(super.defaultOptions, {
      classes: ["newedo", "sheet", "actor"],
      template: "systems/newedo/templates/actor/actor-sheet.html",
      width: 800,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "traits", group: "primary"}]
    });
    LOGGER.log(`Merging object data for actor sheet`, merged);
    return merged
  }

  /** @override */
  get template() {
    LOGGER.log(`Retrieved template for [actor-${this.actor.type}-sheet.html]`)
    return `systems/newedo/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

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

    // Prepare character data and items.
    if (actorData.type == 'character') {
      //this._prepareItems(context);
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

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    LOGGER.log(`Preparing character data`);
    LOGGER.debug(`Localizing character data`);

    //constants to hold references to the diffrent trait links
    const { core, derived } = context.system.traits;

    for (let [k, v] of Object.entries(core)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.traits.core[k]) ?? k;
      v.abr = game.i18n.localize(CONFIG.NEWEDO.traits.coreAbbreviations[k]) ?? k;
      
    }
    // Handle Derived trait scores.
    for (let [k, v] of Object.entries(derived)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.traits.derived[k]) ?? k;
      v.abr = game.i18n.localize(CONFIG.NEWEDO.traits.derivedAbbreviations[k]) ?? k;
    }

    for (let [k, v] of Object.entries(context.system.attributes.armour)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.attributes.armour[k]) ?? k;
    }

    for (let [k, v] of Object.entries(context.system.background)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.backgrounds[k]) ?? k;
    }

    for (let [k, v] of Object.entries(context.system.skills)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.skills[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      /*
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
      */
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    LOGGER.log('Activating sheet listeners')

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

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

    // Rollable traits.
    LOGGER.debug(`Preparing listeners for rollables`);
    html.find('.rollable').click(this._onRoll.bind(this));

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
    LOGGER.debug(`Preparing listeners for skill buttons`);
    html.find('.skilldice').each ((i, li) => {
      let handler = ev => this._cycleSkillDice(ev);
      li.addEventListener("click", handler);
    });

    //fate dice roll clicks
    LOGGER.debug(`Preparing listeners for fate rolls`);
    html.find('.fate-roll').each ((i, li) => {
      let handler = ev => this._fateRoll(ev);
      li.addEventListener("click", handler);
    });

    //prep button that adds new fate to the list
    LOGGER.debug(`Preparing listeners for New Fate button`);
    html.find('.fate-new').each ((i, li) => {
      let handler = ev => this._createNewFate(ev);
      li.addEventListener("click", handler);
    });

    //preps button for deleteing fates
    LOGGER.debug(`Preparing listeners for Fate Delete buttons`);
    html.find('.fate-delete').each ((i, li) => {
      let handler = ev => this._deleteFate(ev);
      li.addEventListener("click", handler);
    });
  }

  /**
   * Handles switching tabs in the fate menu by hiding / showing the active tab.
   * @param {Event} _event the originating click event
   * @private
   */
  async _createNewFate(_event) {
    LOGGER.log(`Creating fate with actor id: ${this.actor.id}`);
    var newFate = {
      "range": {"top": 0, "bot": 0, "size": 0},
      "label": "New fate",
      "description": "Fate description"
    };

    var newIndex = (Object.keys(this.actor.system.fatecard.list).length)
    var fatekey = "system.fatecard.list";
    var newList = [];
    var counter = 0;

    for (let [key, fate] of Object.entries(this.actor.system.fatecard.list)) {
      newList[counter] = this.actor.system.fatecard.list[counter];
      counter += 1;
    }

    newList[counter] = newFate;

    await this.actor.update({[fatekey]: newList});
  }

  /**
   * Handles switching tabs in the fate menu by hiding / showing the active tab.
   * @param {Event} _event the originating click event
   * @private
   */
  async _deleteFate(_event) {
    _event.preventDefault();
    LOGGER.log(`Deleting fate from actor id: ${this.actor.id}`);
    var fateData = this.actor.system.fatecard.list;
    var fateList = [];
    var deleteIndex = _event.target.attributes.fateindex.value;
    var counter = 0;
    
    for (let [key, fate] of Object.entries(fateData)) {
      if (key != deleteIndex){
        fateList[counter] = fate;
        counter += 1;
      }
    }
    await this.actor.update({"system.fatecard.list": fateList});
  }

  /**
   * Handles the cycling of skill dice with button presses
   * @param {Event} _click the originating click event
   * @private
   */
  async _cycleSkillDice(_click) {
    _click.preventDefault();
    
    const _id = _click.target.id;
    const _index = _click.target.attributes.index.value;

    const key = `system.skills.${_id}.rank`;

    const actorData = this.actor.system;
    let skillData = actorData.skills[_id];
    let ranks = foundry.utils.deepClone(skillData.rank);

    LOGGER.log(`Updating skill dice`);
    
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

    await this.actor.update({ [`${key}`]: ranks });

    LOGGER.debug(`Ranks data`, ranks);
    LOGGER.debug(`Key`, key);
  };

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
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

  /**
   * Handle fate roll table calls.
   * @param {Event} event The originating click event
   * @private
   */
  async _fateRoll(event) {
    const fateData = this.actor.system.fatecard;
    const element = event.currentTarget;

    let roll = new Roll("1d100");
    await roll.evaluate();
    const result = roll.total;

    console.log(roll);

    let label = "";
    let description = "";
    let rollRender = await roll.render();

    for (let [key, fate] of Object.entries(fateData.list)) {
      var _bot = fate.range.bot;
      var _top = fate.range.top;
      if ((result >= Math.min(_bot, _top)) && (result <= Math.max(_bot, _top)))
      {
        label = " | " + fate.label;
        description = fate.description;
        console.log("Succesful fate call!");
      }
    }

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
   * 
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
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


