import NewedoItem from "../edo-item.mjs";
import FeatureItemConfig from "../../../apps/feature/feature-item.mjs";
import LOGGER from "../../../system/logger.mjs";

export default class NewedoCulture extends NewedoItem {

    constructor(data, options={}) {
        super(data, options);
        this.features = [];
    }

    get

    create() {
        super.create();
        this.features = [];
    }

    /**
     * Super hacky workaround to deleting an item from an array
     * we jsut create a new array, and copy over all the non matching elements
     * Not sure why but just trying to delete one element wasnt working
     * @param {Event} event 
     */
    async _featureDelete(event) {
        LOGGER.debug(`Deleting a feature`)
        const element = event.target.closest(".feature");
        const id = element.dataset.featureId
        const features = this.system.features;
        const newFeatures = [];

        for (var a = 0; a < features.length; a++) {
            
            if (features[a].id !== id) {
                newFeatures.push(features[a])
            }
        }

        await this.update({"system.features": newFeatures});

        this.render(false);
    }

    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareData() {
        super.prepareData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    async _itemDropDialog(event) {
        const feature = {}
        feature.item = this;
        feature.template = `systems/newedo/templates/dialog/feature/feature-item.hbs`;

        return new FeatureItemConfig(feature, { title: `Feature config` }).render(true);
    }
}