import LOGGER from "../../utility/logger.mjs";
import systemUtility from "../../utility/systemUtility.mjs";
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class NewedoItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["newedo", "sheet", "item"],
      width: 520,
      height: 360,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = `systems/${game.system.id}/templates/item`;
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `item-weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = await super.getData();
    const item = context.item;
    const source = item.toObject();

    foundry.utils.mergeObject(context, {
      source: source.system,
      system: item.system,
      rollData: this.item.getRollData()
    });

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    let actor = this.object.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    //HTML enrichment areas for editing text on items
    const enrichmentOptions = {
      secrets: item.isOwner, async: true, relativeTo: this.item, rollData: context.rollData
    };

    context.itemDescriptionHTML = await TextEditor.enrichHTML(context.system.description, enrichmentOptions);

    //prepares data specific to certain item types
    //mostly includes preparing locilizations for the system
    const type = item.type;
    if (type == `weapon`) {
      context.system.damage.label = systemUtility.Localize(CONFIG.NEWEDO.damageTypes[context.system.damage.type]);
    }
    else if (type == `armour`) {

    }
    else if (type == `kami`) {

    }
    else if (type == `rote`) {
      
    }
    else if (type == `skill`) {

    }
    else if (type == `fate`) {
      
    }

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    html.find('.skill-dice').each ((i, li) => {
      let handler = ev => this._cycleSkillDice(ev);
      li.addEventListener("click", handler);
    });
    // Roll handlers, click handlers, etc. would go here.
  }

  async _cycleSkillDice(_click) {
    _click.preventDefault();

    const _index = _click.target.attributes.index.value;
    const itemData = this.item;
    let system = itemData.system;
    let ranks = system.ranks;
    
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

    await this.item.update({ [`system.ranks`]: ranks });
  };
}
