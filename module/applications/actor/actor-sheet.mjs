import { onManageActiveEffect, prepareActiveEffectCategories } from "../../helpers/effects.mjs";
import LOGGER from "../../system/logger.mjs";
import sysUtil from "../../system/sysUtil.mjs";
import { NewedoSheetMixin } from "../base-sheet.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class NewedoActorSheet extends NewedoSheetMixin(foundry.applications.sheets.ActorSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["newedo", "sheet", "actor"],
        position: { height: 600, width: 700, top: 100, left: 200 },
        actions: {
            useItem: this._onUseItem,
            editItem: this._onEditItem,
            deleteItem: this._onDeleteItem,
            equipItem: this._onEquipItem,
            skillDice: this._onSkillDice,
            roll: this._onRoll,
            rollFate: this._onRollFate,
        }
    }

    static PARTS = {
        body: { template: "systems/newedo/templates/actor/actor-character-sheet.hbs" },
        panel: { template: "systems/newedo/templates/actor/character/character-panel.hbs" },
        header: { template: "systems/newedo/templates/actor/character/character-header.hbs" },
        traits: { template: "systems/newedo/templates/actor/character/character-traits.hbs" },
        skills: { template: "systems/newedo/templates/actor/character/character-skills.hbs" },
        equipment: { template: "systems/newedo/templates/actor/character/character-equipment.hbs" },
        magic: { template: "systems/newedo/templates/actor/character/character-magic.hbs" },
        augments: { template: "systems/newedo/templates/actor/character/character-augs.hbs" },
        description: { template: "systems/newedo/templates/actor/character/character-bio.hbs" }
    }

    static TABS = {
        traits: { id: "traits", group: "primary", label: "NEWEDO.tab.traits" },
        skills: { id: "skills", group: "primary", label: "NEWEDO.tab.skills" },
        equipment: { id: "equipment", group: "primary", label: "NEWEDO.tab.equipment" },
        augments: { id: "augments", group: "primary", label: "NEWEDO.tab.augs" },
        magic: { id: "magic", group: "primary", label: "NEWEDO.tab.magic" },
        description: { id: "description", group: "primary", label: "NEWEDO.tab.bio" }
    }

    tabGroups = {
        primary: "traits"
    }

    //control variables and static macros for them
    static MODES = {
        PLAY: 1,
        EDIT: 2,
    }
    _mode = this.constructor.MODES.PLAY;
    _editable = true;

    /** @override */
    get template() {
        return `systems/${game.system.id}/templates/actor/actor-${this.document.type}-sheet.hbs`;
    }

    /* --------------------------------------------- Prepare actor sheet --------------------------------------------- */

    /** @override */
    _prepareContext(options) {
        const doc = this.document;
        const rollData = doc.getRollData();

        const context = {
            document: doc,
            config: CONFIG.NEWEDO,
            system: doc.system,
            name: doc.name,
            items: doc.items,
            itemTypes: doc.itemTypes,
            rollData: rollData,
            tabs: this._getTabs(),
            isEditMode: this.isEditMode,
            isPlayMode: this.isPlayMode,
            isEditable: this.isEditable
        }

        this._prepareItems(context);
        this._prepareCharacterData(context);

        return context;
    }

    /** @override */
    getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        const actorData = this.document.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;
        context.items = actorData.items;
        context.editable = this.isEditable && (this._mode === this.constructor.MODES.EDIT);

        context.theme = "light";
        if (game.settings.get(game.system.id, "darkmode")) context.theme = "dark";

        // Prepare character data and items.
        if (actorData.type == 'character') {
            this._prepareItems(context);
            this._prepareCharacterData(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        // Prepare active effects
        context.effects = prepareActiveEffectCategories(this.document.effects);
        return context;
    }

    /**
     * Organize and classify Items for Character sheets.
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     */
    _prepareCharacterData(context) {
        //constants to hold references to the diffrent trait links
        const { core, derived } = context.system.traits;
        const attributes = context.system.attributes;

        //core traits
        for (let [k, v] of Object.entries(core)) {
            v.label = sysUtil.Localize(CONFIG.NEWEDO.trait.core[k]);
            v.abr = sysUtil.Localize(CONFIG.NEWEDO.trait.core.abbr[k]);
        }
        
        // Derived traits.
        for (let [k, v] of Object.entries(derived)) {
            v.label = sysUtil.Localize(CONFIG.NEWEDO.trait.derived[k]);
            v.abr = sysUtil.Localize(CONFIG.NEWEDO.trait.derived.abbr[k]);
        }

        //localize armour labels
        for (let [k, v] of Object.entries(context.system.armour)) {
            v.label = sysUtil.Localize(CONFIG.NEWEDO.damage[k]);
            v.abr = sysUtil.Localize(CONFIG.NEWEDO.damage.abbr[k]);
        }

        for (let [k, v] of Object.entries(context.system.background)) {
            v.label = sysUtil.Localize(CONFIG.NEWEDO.background[k]);
        }
    }

    /**
     * Organize and classify Items for Character sheets
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     */
    _prepareItems(context) {
        // Initialize containers.
        const fates = [];
        const skills = {
            pow: [],
            ref: [],
            hrt: [],
            pre: [],
            sav: [],
            per: []
        };

        // Iterate through items, allocating to containers
        for (let i of context.itemTypes.skill) {
            i.img = i.img || DEFAULT_TOKEN;
            // Append to gear.

            if (i.system.trait === `pow`) skills.pow.push(i);
            else if (i.system.trait === `ref`) skills.ref.push(i);
            else if (i.system.trait === `hrt`) skills.hrt.push(i);
            else if (i.system.trait === `pre`) skills.pre.push(i);
            else if (i.system.trait === `sav`) skills.sav.push(i);
            else if (i.system.trait === `per`) skills.per.push(i);

        }
        context.skills = skills;

        //organize fates list by their range
        function fateCompare(a, b) {
            if (a.system.range.max > b.system.range.max) {
                return -1;
            }
            if (a.system.range.max < b.system.range.max) {
                return 1;
            }
            return 0;
        }
        context.fates = [];
        context.fates = fates.concat(context.itemTypes.fate);
        context.fates.sort(fateCompare);
    }

    /* ------------------------------------------- Action Event Handlers ------------------------------------------- */

    //_________________________________________________________________________________________________Item Events
    static async _onEditItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        if (!item.sheet.rendered) item.sheet.render(true);
        else item.sheet.bringToFront();
    };

    static async _onUseItem(event, target) {
        // Get the item were actually targeting
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        // Grabs an optional argument to pass to the item, useful for when an item has multiple use cases such as weapons attacking / damaging
        const action = target.closest("[data-use]")?.dataset.use;
        
        return item.use(action);
    };

    static async _onEquipItem(event, target) {

    };

    static async _onDeleteItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);
        const content = TextEditor
        const confirm = await foundry.applications.api.DialogV2.confirm({
            content: `${sysUtil.Localize('NEWEDO.confirm.deleteItem')}: ${item.name}`,
            rejectClose: false,
            modal: true
        });
        if (confirm) return item.delete();
    }

    //_________________________________________________________________________________________________Roll Events
    /**
     * Generic roll event, prompts user to spend legend and confirm the roll formula
     * @param {Event} event 
     * @param {HTMLElement} target 
     */
    static async _onRoll(event, target) {
        LOGGER.debug(`Standard roll action`, target);
        var formula = target.dataset.roll;
        const rollData = this.document.getRollData();
        rollData.formula = formula;

        const options = await sysUtil.getRollOptions(rollData);
        if (options.canceled) return null;// Stops the roll if they decided they didnt want to have fun

        // Grabs the formula
        formula = options.formula;
        var bonus = 0;

        // Apply legend
        if (options.legend > 0) {
            if (!sysUtil.spendLegend(this.document, options.legend)) {
                return null;
            } else bonus += options.legend;
        }

        // Apply wounds
        if (options.wounded && rollData.wound.penalty < 0) bonus += rollData.wound.penalty;

        if (bonus > 0) formula += `+` + bonus;
        if (bonus < 0) formula += bonus;

        // Make the roll object
        let r = new Roll(formula, rollData);
        LOGGER.debug("Dice terms:", r.dice);

        // Managed if we have advantage / disadvantage
        if (options.advantage == "advantage") {
            for (var a of r.dice) {
                if (a.faces == 10) {
                    a.number += 1;
                }
            }
        } else if (options.advantage == `disadvantage`) {
            for (var a of r.dice) {
                if (a.faces == 10) {
                    a.number -= 1;
                }
            }
        }
        // After altering the roll formula we need to update the source for the chat message
        r._formula = r.formula;

        var label = `<div>${target.dataset.label}</div>`
        if (options.advantage != `normal`) {
            label += `<div>${options.advantage}</div>`;
        }
        

        await r.evaluate();
        var render = r.render();
        return r.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.document }),
            flavor: label,
            content: render,
            create: true,
            rollMode: game.settings.get('core', 'rollMode')
        });
    }

    /**Handle fate roll table calls
     * Managed seperately from the standard roll function to maintain simplicity
     * @param {Event} event The originating click event
     * @private
     */
    static async _onRollFate(event, target) {
        const roll = new Roll('1d100');
        await roll.evaluate();
        var render = await roll.render();

        var label = "";
        var description = "";

        for (var fate of this.document.itemTypes.fate) {
            var _bot = fate.system.range.min;
            var _top = fate.system.range.max;

            //checks that the roll result is in range, regardless if the start and end of the range are configured properly
            if (roll.total >= Math.min(_bot, _top) && roll.total <= Math.max(_bot, _top)) {
                label = " | " + fate.name;
                description = fate.system.description;
                break;
            }
        }


        //creates the role message, adding in the description and fate title if one was rolled
        //The description is enrichedHTML and can have inlineroles and UUID links
        return roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.document }),
            flavor: `<div style="font-size: 20px; text-align: center;">${sysUtil.Localize('NEWEDO.generic.fate')}` + [label] + `</div>`,
            content: [render] + "<div>" + [description] + "</div>",
            create: true,
            rollMode: game.settings.get('core', 'rollMode')
        });
    }
    /**
     * Calls the relevant skills cycle dice function
     * @param {Event} event the originating click event
     * @private
     */
    static async _onSkillDice(event, target) {
        event.preventDefault();
        const _id = target.closest('.item[data-item-uuid]').dataset.itemUuid.match(/\w+$/)[0];
        return this.document.items.get(_id)?._cycleSkillDice(event);
    };

    /* -------------------------------------------- Drag Drop -------------------------------------------- */
    async _onDrop(event) {
        if (!this.document.isOwner) return false;// Disables drops if you dont own this sheet
        super._onDrop(event);
    }

    async _onDropItem(event, item) {
        
        return 'default'; // Tells sheet to use default item drop handler
    }
    /* -------------------------------------------- Item management -------------------------------------------- */
    async _installAugment(event) {
        LOGGER.debug("Installing augment");
        const actor = this.document;
        const item = (event.currentTarget.closest('.item') !== null) ? actor.items.get(event.currentTarget.closest('.item').dataset.itemId) : null;

        if (item !== null) {
            await item.update({ 'system.installed': !item.system.installed });
            LOGGER.log(`Augment [${item.name}] install changed to [${item.system.installed}]`);
        }
    }
}