import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";
import LOGGER from "../system/logger.mjs";
import sysUtil from "../system/sysUtil.mjs";
import { NewedoSheetMixin } from "./edo-base-sheet.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class NewedoActorSheet extends NewedoSheetMixin(foundry.applications.sheets.ActorSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "actor"],
        position: { height: 600, width: 700, top: 100, left: 200 },
        actions: {
            useItem: this._onUseItem,
            editItem: this._onEditItem,
            deleteItem: this._onDeleteItem,
            rollFate: this._onRollFate
        }
    }

    static PARTS = {
        body: { template: "systems/newedo/templates/actor/actor-character-sheet.hbs"}
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
    static get defaultOptions() {
        var merged = foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["newedo", "sheet", "actor"],
            template: `systems/${game.system.id}/templates/actor/actor-sheet.hbs`,
            width: 800,
            height: 700,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "traits", group: "primary" }]
        });
        return merged
    }

    /** @override */
    get template() {
        return `systems/${game.system.id}/templates/actor/actor-${this.actor.type}-sheet.hbs`;
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
        const actorData = this.actor.toObject(false);

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
        context.effects = prepareActiveEffectCategories(this.actor.effects);
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
        for (let [k, v] of Object.entries(attributes.armour)) {
            v.label = sysUtil.Localize(CONFIG.NEWEDO.damage.abbr[k]);
        }

        for (let [k, v] of Object.entries(context.system.background)) {
            v.label = sysUtil.Localize(CONFIG.NEWEDO.background[k]);
        }

        context.wound = sysUtil.woundState(attributes.wound.value);
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
            pow: [],
            ref: [],
            hrt: [],
            pre: [],
            sav: [],
            per: []
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
            if (a.system.range.max > b.system.range.max) {
                return -1;
            }
            if (a.system.range.max < b.system.range.max) {
                return 1;
            }
            return 0;
        }

        fates.sort(fateCompare);
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        // Render the item sheet for viewing/editing prior to the editable check.
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item, .fate-item");
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
        //fate dice roll clicks
        html.find('.fate-roll').each((i, li) => {
            let handler = ev => this._onRollFate(ev);
            li.addEventListener("click", handler);
        });
        /* --------------------- Embedded item controls --------------------- */
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
        html.find('.skill-dice-button').each((i, li) => {
            let handler = ev => this._cycleSkillDice(ev);
            li.addEventListener("click", handler);
            li.addEventListener("contextmenu", handler);
        });
        //installing augments
        html.find(`.aug-install`).each((index, element) => {
            let handler = (ev => this._installAugment(ev));
            element.addEventListener("click", handler);
            element.addEventListener("contextmenu", handler);
        });
    }

    /* -------------------------------------------- Sheet event handelers -------------------------------------------- */
    /**
     * Calls the relevant skills cycle dice function
     * @param {Event} event the originating click event
     * @private
     */
    async _cycleSkillDice(event) {
        const element = event.currentTarget;
        const _id = element.closest('.item').dataset.itemId;
        return this.actor.items.get(_id)._cycleSkillDice(event);
    };

    /* -------------------------------------------- Item management -------------------------------------------- */
    async _installAugment(event) {
        LOGGER.debug("Installing augment");
        const actor = this.actor;
        const item = (event.currentTarget.closest('.item') !== null) ? actor.items.get(event.currentTarget.closest('.item').dataset.itemId) : null;

        if (item !== null) {
            await item.update({ 'system.installed': !item.system.installed });
            LOGGER.log(`Augment [${item.name}] install changed to [${item.system.installed}]`);
        }
    }
    /* ----------------------------------------------- ROLL FUNCTIONS --------------------------------------------------------------- */
    ///Roll functions, a general roll is called, which then specifies the specific roll type to use
    async _onRoll(event) {
        LOGGER.debug("ACTOR | SHEET | ROLLING");
        event.preventDefault();

        // the closest() function will search up the hierachy for a match
        // if it cant find a match for the given roll, then we can assume its not that roll
        // There is probably a more efficient way to run this, but this works for now
        const data = {
            item: event.currentTarget.closest('.item'),
            trait: event.currentTarget.closest('[data-trait]'),
            background: event.currentTarget.closest('[data-background]')
        }

        // Grabs data to use for the roll, we use context clues to decide which roll is actually being made, and giving certain roll types priority in a tie
        const context = {};
        context.event = event;
        context.actor = this.actor;
        context.item = (data.item) ? this.actor.items.get(data.item.dataset.itemId) : null;

        context.trait = (data.trait) ? duplicate(this.actor.system.traits.core[data.trait.dataset.trait]) : null;
        if (context.trait) context.trait.id = data.trait.dataset.trait;

        context.background = (data.background) ? duplicate(this.actor.system.background[data.background.dataset.background]) : null;
        if (context.background) context.background.id = data.background.dataset.trait;

        if (context.item) {
            //if this is an item roll
            switch (context.item.type) {
                case `skill`:// Intentional fallthrough, all items that can be rolled specify it themselves
                case `rote`:
                case `weapon`:
                    context.item.roll();
                    break;
                default:
                    this._rollStandard(event);
                    break;
            }
        } else {
            /* STANDARD ROLL DIALOG
            This should be used whenever you arent sure of what the fuck you should be doing, this gives a dialog with editable formula box
            and the automated option to spend legend and apply wounds, toggled on or off, and the option to roll advantage or disadvantage
            */
            var formula = "";
            const rollData = this.actor.getRollData();
            rollData.title = "Roll";
            rollData.formula = "";

            // Adds the respecitve dice to the roll, and sets their string value to render in the template
            if (context.background) rollData.formula = `${context.background.rank}d10x10`;
            else if (context.trait) rollData.formula = `${context.trait.rank}d10x10`;


            const options = await sysUtil.getRollOptions(rollData);
            if (options.canceled) return null;// Stops the roll if they decided they didnt want to have fun

            // Grabs the formula
            formula = options.formula;
            var bonus = 0;

            // Apply legend
            if (options.legend > 0) {
                if (sysUtil.spendLegend(this.actor, options.legend) === null) {
                    sysUtil.warn("NEWEDO.notify.notEnoughLegend");
                    return null;
                }
                bonus += options.legend;
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


            await r.evaluate();
            r.toMessage();
        }
    }

    /**Handle fate roll table calls
     * Managed seperately from the standard roll function to maintain simplicity
     * @param {Event} event The originating click event
     * @private
     */
    async _onRollFate(event) {
        LOGGER.debug(`Rolling fate`);
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
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: "<div style=\"font-size: 20px; text-align: center;\">Fate" + [label],
            content: [rollRender] + "<div>" + [description] + "</div>",
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
        LOGGER.debug("Caught an unhandled roll request");
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