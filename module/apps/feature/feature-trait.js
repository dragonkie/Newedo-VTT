import LOGGER from "../../utility/logger.mjs";
import FeatureConfig from "./feature.js";

export default class FeatureTraitConfig extends FeatureConfig {
    constructor(feature, options = {}) {
        super(feature, options);
        this.type = "trait"
    }

    static get defaultOptions() {
        let options = super.defaultOptions;
        options.template = "systems/newedo/templates/dialog/feature/feature-trait.hbs";

        return options;
    }

    _updateObject(event, formdata) {
        LOGGER.log(`Formdata`, formdata);
        this.data = {};
        for (let [key, value] of Object.entries(formdata)) {
            if (key != "label") this.data[key] = value
        }

        super._updateObject(event, formdata);
    }
}