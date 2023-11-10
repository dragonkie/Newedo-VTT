import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class NewedoActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["newedo", "sheet", "actor"],
      template: "systems/newedo/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
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
    //constants to hold references to the diffrent trait links
    const { core, derived } = context.system.traits;

    for (let [k, v] of Object.entries(core)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.traits.core[k]) ?? k;
    }
    // Handle Derived trait scores.
    for (let [k, v] of Object.entries(derived)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.traits.derived[k]) ?? k;
    }

    for (let [k, v] of Object.entries(context.system.attributes.armour)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.attributes.armour[k]) ?? k;
    }

    for (let [k, v] of Object.entries(context.system.skills)) {
      v.label = game.i18n.localize(CONFIG.NEWEDO.skills[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
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
    html.find('.skilldice').each ((i, li) => {
      let handler = ev => this._cycleSkillDice(ev);
      li.addEventListener("click", handler);
    });
    //fatecard range evaluator
    html.find('.fate-ability').each ((i, li) => {
      let handler = ev => this._fateUpdate(ev);
      li.addEventListener("change", handler);
    });

    html.find('.fate-roll').each ((i, li) => {
      let handler = ev => this._fateRoll(ev);
      li.addEventListener("click", handler);
    });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} _click the originating click event
   * @private
   */
  _cycleSkillDice(_click) {
    const _id = _click.target.id;
    switch (_click.target.value) {
      case "0":
        this.actor.update({[_id]:4});
        break;
      case "4":
        this.actor.update({[_id]:6});
        break;
      case "6":
        this.actor.update({[_id]:8});
        break;
      case "8":
        this.actor.update({[_id]:12});
        break;
      case "12":
        this.actor.update({[_id]:0});
        break;
      default:
        this.actor.update({[_id]:0});
        break;
    }
  };

  /**
   * Handle clickable rolls.
   * @param {Event} _input the originating click event
   * @private
   */
  _fateUpdate(_input) {
    const actorData = this.actor;
    const fateData = this.actor.system.fatecard;

    /*
    if (fateData.method == "range") {
      for (let [key, fate] of Object.entries(fateData.list)) {
        //corrects for inverted range values, and ensures the scale range is set properly
        const _t = fate.range.top;
        const _b = fate.range.bot;
        const _path = "system.fatecard.list."+key;
        if (_t < _b) {
          console.log("NEWEDO | Fate entry has inverted range, correcting...")
          const _pt = {[_path+".range.top"] : _b};
          const _pb = {[_path+".range.bot"] : _t};
          actorData.update(_pt);
          actorData.update(_pb);
        }
      }
    } else {

    }
    actorData.getData();
    */
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
      console.log(key+" | "+result+" -> "+fate.range.top+","+fate.range.bot);
      if ((result >= fate.range.bot) && (result <= fate.range.top))
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
   * Handle clickable rolls.
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


