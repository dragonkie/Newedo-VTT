import LOGGER from "../helpers/logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";
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
                let newItem = item.toObject();
                createData.items.push(newItem);
            });
        }

        LOGGER.debug("CreateData:", createData);
        const actor = await super.create(createData, options);
        return actor;
    }

    prepareData() {
        LOGGER.groupCollapsed(`ACTOR | prepareData | `+this.name);
        LOGGER.debug('Actor uuid:', this.uuid);
        super.prepareData();
        LOGGER.groupEnd();
    }

    prepareEmbeddedDocuments() {
        LOGGER.groupCollapsed(`prepareEmbeddedDocuments`)
        super.prepareEmbeddedDocuments();
        LOGGER.groupEnd();
    }

    /*-------------------------------------------------------------------*/
    /*                         UPDATE FUNCTIONS                          */
    /*-------------------------------------------------------------------*/

    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
    }

    async deleteDialog(options = {}) {
        const type = sysUtil.localize(this.constructor.metadata.label);
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

    /**
     * 
     * @param {String} slug the identifying slug of the actor to retrieve 
     * @returns 
     */
    getSkill(slug) {
        for (let skill of this.itemTypes.skill) {
            if (skill.system.slug == slug) return skill;
        }
        return undefined;
    }

    /**
     * Shorthand for grabbing values from long paths quickly
     * @param {String} tag localize tag for the requested field
     * @returns {Object} safe clone of requested data
     */
    getTrait(tag) {
        switch (tag) {
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

    get woundPenalty() {
        return this.system.wound.value;
    }

    // Item getters, useable with handelbars for itterable arrays of items sorted by type
    get skills() {
        return this.itemTypes.skill;
    }

    get weapons() {
        return this.itemTypes.weapon;
    }
}