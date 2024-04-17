import LOGGER from "../../utility/logger.mjs";
import FeatureConfig from "./feature.js";

/**
 * Gives all items of this feature to the parent actor
 */
export default class FeatureItemConfig extends FeatureConfig {
    constructor(feature, options = {}) {
        super(feature, options);
        this.type = "item"
        if (this.label == null) this.label = "NEWEDO.feature.new.item";
    }

    static get defaultOptions() {
        let options = super.defaultOptions;
        options.template = "systems/newedo/templates/dialog/feature/feature-item.hbs";

        return options;
    }

    get items() {
        return this.data;
    }

    async getData() {
        const data = await super.getData();
        data.items = duplicate(this.items);
        data.items.forEach(async (item) => {
            item.link = await TextEditor.enrichHTML(`@UUID[${item.uuid}]`);
            item.link = item.link.replaceAll("undefined", item.name)
            console.log(item.link)
        })
        console.log(data)
        return data;
    }

    async _onDropItem(event, data) {
        const item = await fromUuid(data.object.uuid);

        if (Array.isArray(this.data) && this.data.length > 0 && item.type !== `weapon`) {
            for (const i of this.data) {
                if (i.uuid === data.object.uuid) {
                    ui.notifications.warn(`NEWEDO.notify.feature.item.duplicateItem: ${item.type}`);
                    return null;
                }
            }
        }
        
        if (item) {
            this.data.push({
                name: item.name,
                uuid: item.uuid
            });
        }
        this.submit();
        this.render(false);
    }
}