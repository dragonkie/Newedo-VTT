import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
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
            const coreItems = await sysUtil.getCoreCharDocs();
            coreItems.forEach((item) => {
                var newItem = item.toObject();
                createData.items.push(newItem);
            });
        }

        LOGGER.debug("CreateData:", createData);
        const actor = await super.create(createData, options);
        return actor;
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
        const system = actorData.system;
        const { core, derived } = system.traits;
        const flags = actorData.flags.newedo || {};

        // Loop through core traits and calculate their rank, traits are not included in the "Round everything up" rule
        for (let [key, trait] of Object.entries(core)) {
            trait.rank = Math.max(Math.floor(trait.value / 10), 0);
        }

        // Calculates derived traits for initative, move, defence, resolve, and max health
        derived.init.value = Math.ceil( (core.sav.value + core.ref.value) * derived.init.mod );
        derived.move.value = Math.ceil( ((core.hrt.value + core.ref.value) / system.attributes.size.value) * derived.move.mod );
        derived.def.value = Math.ceil( (core.pow.value + core.ref.value) * derived.def.mod );
        derived.res.value = Math.ceil( (core.hrt.value + core.pre.value) * derived.res.mod );

        // Sets health range, MIN is included for use with the token resource bars
        system.hp.max = Math.ceil(core.hrt.value * system.hp.mod);
        system.hp.min = 0;

        // Gets the characters wound state
        system.wound = sysUtil.woundState(system.hp.value / system.hp.max);

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
        const {core, derived} = system.traits;
        const attributes = system.attributes;

        //calculates ranks for background, idk why it doesnt scale as just 1 rank per 20 points?
        for (let [key, background] of Object.entries(system.background)) {
            background.value = sysUtil.clamp(background.value, 0, 100);
            background.rank = sysUtil.backgroundRank(background.value);
        }

        //calculates characters legend rank
        system.legend.rank = sysUtil.legendRank(system.legend.max);

        //checks how much noise the character has from augments
        var biofeedback = 0;
        for (let [key, item] of this.items.entries()) {
            if (item.type === `augment`) {
                if (item.system.installed) {
                    LOGGER.debug("Found installed augment:", item);
                    var rank = item.system.rank;
                    var noise = item.system.noise;
                    biofeedback += item.system.biofeedback;
                    // Adds the noise from the item to the counter
                    core.pow.noise += noise.pow * rank;
                    core.ref.noise += noise.ref * rank;
                    core.hrt.noise += noise.hrt * rank;
                    core.sav.noise += noise.sav * rank;
                    core.per.noise += noise.per * rank;
                    core.pre.noise += noise.pre * rank;
                }
            }
        }

        // Calculates biofeedback fate chance
        const bioFate = this.items.getName(`Biofeedback`);
        if (bioFate) {
            if (biofeedback > 0) bioFate.update({ 'system.range.min': 4, 'system.range.max': 3 + biofeedback });
            else bioFate.update({ 'system.range.min': 0, 'system.range.max': 0 });
        }
    }

    /**
     * Prepare NPC type specific data.
     */
    _prepareNpcData(actorData) {
        if (actorData.type !== 'npc') return;
        // Make modifications to data here. For example:
    }

    async deleteDialog(options={}) {
        const type = newedo.util.localize(this.constructor.metadata.label);
        let confirm = await foundry.applications.api.DialogV2.confirm({
            title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${this.name}`,
            content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.format("SIDEBAR.DeleteWarning", { type })}</p>`,
            options: options
        });

        if (confirm) {
            this.delete();
            return true;
        } else return false;
    }

    /**
     * @Override getRollData() that's supplied to rolls.
     */
    getRollData() {
        // the base actor does not return a safe copy, so we must make it safe
        const data = foundry.utils.deepClone(super.getRollData());

        // Copy core traits
        if (data.traits.core) {
            for (let [k, v] of Object.entries(data.traits.core)) {
                data[k] = v;
            }
        }

        // Copys derived traits
        if (data.traits.derived) {
            for (let [k, v] of Object.entries(data.traits.derived)) {
                data[k] = v;
            }
        }

        return data;
    }

    getSkill(name) {
        const skills = this.itemTypes.skill;
        for (var skill of skills) {
            if (skill.name === name) return skill;
        }
        return undefined;
    }

    /**
     * Shorthand for grabbing values from long paths quickly
     * @param {String} tag localize tag for the requested field
     * @returns {Object} safe clone of requested data
     */
    getTrait(tag) {
        switch(tag) {
            case 'pow':
            case 'ref':
            case 'hrt':
            case 'sav':
            case 'shi':
            case 'per':
            case 'pre':
                return sysUtil.duplicate(this.system.traits.core[tag]);
            case 'init':
            case 'move':
            case 'def':
            case 'res':
                return sysUtil.duplicate(this.system.traits.derived[tag]);
            case 'hp':
                return sysUtil.duplicate(this.system.hp);
            case 'kin':
            case 'ele':
            case 'bio':
            case 'arc':
                return sysUtil.duplicate(this.system.armour[tag]);
            default: return undefined;
        }
    }

    get traits() {
        return this.system.traits;
    }

    get attributes() {
        return this.system.attributes;
    }

    get woundPenalty() {
        return this.system.wound.penalty;
    }

    // Item getters, useable with handelbars for itterable arrays of items sorted by type
    get skills() {
        return this.itemTypes.skill;
    }

    get weapons() {
        return this.itemTypes.weapon;
    }
}