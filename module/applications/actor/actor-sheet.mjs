import { onManageActiveEffect, prepareActiveEffectCategories } from "../../helpers/effects.mjs";
import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { NewedoSheetMixin } from "../base-sheet.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class NewedoActorSheet extends NewedoSheetMixin(foundry.applications.sheets.ActorSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["actor"],
        position: { height: 600, width: 700, top: 100, left: 200 },
        actions: {
            useItem: this._onUseItem,
            editItem: this._onEditItem,
            deleteItem: this._onDeleteItem,
            skillDice: this._onSkillDice,
            roll: this._onRoll,
            rollFate: this._onRollFate,
            editLedger: this._onEditLedger,
            fateDisplay: this._onChangeFateDisplay,
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

    /** @override */
    get template() {
        return `systems/${game.system.id}/templates/actor/actor-${this.document.type}-sheet.hbs`;
    }

    /* -------------------------------------------------------------------------------------- */1
    /*                                                                                        */
    /*                                   DATA PREPERATION                                     */
    /*                                                                                        */
    /* -------------------------------------------------------------------------------------- */

    /** @override */
    async _prepareContext() {
        const context = await super._prepareContext();

        // Use a safe clone of the actor data for further operations.
        const actorData = this.document.toObject(false);
        // Add the actor's data to cfontext.data for easier access, as well as flags.
        context.items = actorData.items;
        context.editable = this.isEditable && (this._mode === this.constructor.SHEET_MODES.EDIT);

        // Prepare character data and items.
        if (actorData.type == 'character') {
            this._prepareItems(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = this.document.getRollData();

        // Prepare active effects
        context.effects = prepareActiveEffectCategories(this.document.effects);

        this._prepareItems(context);

        LOGGER.debug('SHEET | ACTOR | PREPARE CONTEXT', context);
        return context;
    }

    /**
     * Organize and classify Items for Character sheets
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     */
    _prepareItems(context) {
        // Initialize containers.
        let slugs = [];
        let skills = {
            pow: {
                label: sysUtil.localize('NEWEDO.trait.core.pow'),
                list: []
            },
            pre: {
                label: sysUtil.localize('NEWEDO.trait.core.pre'),
                list: []
            },
            per: {
                label: sysUtil.localize('NEWEDO.trait.core.per'),
                list: []
            },
            sav: {
                label: sysUtil.localize('NEWEDO.trait.core.sav'),
                list: []
            },
            ref: {
                label: sysUtil.localize('NEWEDO.trait.core.ref'),
                list: []
            },
            hrt: {
                label: sysUtil.localize('NEWEDO.trait.core.hrt'),
                list: []
            },
        }

        // Sort the mega list so the displayed lists are alphabetical
        context.itemTypes.skill.sort((a, b) => ('' + a.name).localeCompare(b.name))
        // Iterate through items, allocating to containers
        for (let i of context.itemTypes.skill) {
            i.img = i.img || DEFAULT_TOKEN;

            switch (i.system.trait) {
                case 'pow':
                    skills.pow.list.push(i);
                    break;
                case 'ref':
                    skills.ref.list.push(i);
                    break;
                case 'hrt':
                    skills.hrt.list.push(i);
                    break;
                case 'pre':
                    skills.pre.list.push(i);
                    break;
                case 'sav':
                    skills.sav.list.push(i);
                    break;
                case 'per':
                    skills.per.list.push(i);
                    break;
            }
        }

        context.skills = {
            l: {
                pow: skills.pow,
                hrt: skills.hrt,
                ref: skills.ref,
                pre: skills.pre
            },
            r: {
                per: skills.per,
                sav: skills.sav
            }
        }

        //Proxies the fate list so we don't disorganize it
        context.fates = [].concat(context.itemTypes.fate);
    }

    /* -------------------------------------------------------------------------------------- */
    /*                                                                                        */
    /*                                   SHEET ACTIONS                                        */
    /*                                                                                        */
    /* -------------------------------------------------------------------------------------- */
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

        return item.system.use(action);
    };

    static async _onEditLedger(event, target) {
        let path = target.dataset?.target;// the value this ledger is targeting
        let label = target.dataset?.label;// the display name of this ledger, localizeable
        let id = target.dataset?.id;// identifier for which ledger is the one we want to pull up


        if (!id) {
            LOGGER.error('Missing ledger id')
            return null;
        }

        let ledgers = this.document.getFlag('newedo', 'ledger');

        // creates the ledger flag if it doesnt exist
        if (!ledgers) {
            LOGGER.debug('Creating ledger flag...')
            await this.document.setFlag('newedo', 'ledger', {});
            ledgers = this.document.getFlag('newedo', 'ledger');
        }
        // If the ledger flag doesnt have our id, add it to the list
        if (!ledgers[id]) {
            // adds the new ledger to the list
            let newLedger = {
                [id]: {
                    id: id,
                    label: label,
                    transactions: [],
                    target: path
                }
            }
            await this.document.setFlag('newedo', 'ledger', newLedger);
            ledgers = this.document.getFlag('newedo', 'ledger');
        }

        new newedo.applications.NewedoLedger(this.document, ledgers[id]).render(true);
    }

    static async _onDeleteItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);
        const content = TextEditor
        const confirm = await foundry.applications.api.DialogV2.confirm({
            content: `${sysUtil.localize('NEWEDO.confirm.deleteItem')}: ${item.name}`,
            rejectClose: false,
            modal: true
        });
        if (confirm) return item.delete();
    }

    static _onChangeFateDisplay() {
        let settings = game.user.getFlag('newedo', 'settings');
        if (!settings) game.user.setFlag('newedo', 'settings', { fateDisplay: 'range' }).then(() => this.render(false));
        else if (settings.fateDisplay == 'range') game.user.setFlag('newedo', 'settings', { fateDisplay: '%' }).then(() => this.render(false));
        else game.user.setFlag('newedo', 'settings', { fateDisplay: 'range' }).then(() => this.render(false));
    }

    //_________________________________________________________________________________________________Roll Events
    /**
     * Generic roll event, prompts user to spend legend and confirm the roll formula
     * @param {Event} event 
     * @param {HTMLElement} target 
     */
    static async _onRoll(event, target) {
        LOGGER.debug(`Standard roll action`, target);
        let formula = target.dataset.roll;
        const rollData = this.document.getRollData();
        rollData.formula = formula;

        const options = await sysUtil.getRollOptions(rollData);
        if (options.canceled) return null;// Stops the roll if they decided they didnt want to have fun

        // Grabs the formula
        formula = options.formula;
        let bonus = 0;

        // Apply legend
        if (options.legend > 0) {
            if (!sysUtil.spendLegend(this.document, options.legend)) {
                return null;
            } else bonus += options.legend;
        }

        // Apply wounds
        if (options.useWound && rollData.wound.value < 0) bonus += rollData.wound.value;

        if (bonus > 0) formula += `+` + bonus;
        if (bonus < 0) formula += bonus;

        // Make the roll object
        let r = new Roll(formula, rollData);
        LOGGER.debug("Dice terms:", r.dice);

        // Managed if we have advantage / disadvantage
        if (options.advantage == "advantage") {
            for (let a of r.dice) {
                if (a.faces == 10) {
                    a.number += 1;
                }
            }
        } else if (options.advantage == `disadvantage`) {
            for (let a of r.dice) {
                if (a.faces == 10) {
                    a.number -= 1;
                }
            }
        }
        // After altering the roll formula we need to update the source for the chat message
        r._formula = r.formula;

        let label = `<div>${target.dataset.label}</div>`
        if (options.advantage != `normal`) {
            label += `<div>${options.advantage}</div>`;
        }


        await r.evaluate();
        let render = r.render();
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
        let render = await roll.render();

        let label = "";
        let description = "";

        for (let fate of this.document.itemTypes.fate) {
            let _bot = fate.system.start;
            let _top = fate.system.end;

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
            flavor: `<div style="font-size: 20px; text-align: center;">${sysUtil.localize('NEWEDO.generic.fate')}` + [label] + `</div>`,
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
        return this.document.items.get(_id)?.system._cycleSkillDice(target.dataset.index, event.shiftKey);
    };

    /* -------------------------------------------------------------------------------------- */
    /*                                                                                        */
    /*                                  DRAG & DROP                                           */
    /*                                                                                        */
    /* -------------------------------------------------------------------------------------- */
    async _onDrop(event) {
        if (!this.document.isOwner) return false;// Disables drops if you dont own this sheet
        super._onDrop(event);
    }

    async _onDropItem(event, item) {

        return 'default'; // Tells sheet to use default item drop handler
    }
}