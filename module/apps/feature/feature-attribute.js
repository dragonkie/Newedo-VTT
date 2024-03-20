import LOGGER from "../../utility/logger.mjs";
import FeatureConfig from "./feature.js";

export default class FeatureAttributeConfig extends FeatureConfig {
    constructor(feature, options = {}) {
        super(feature, options);
        this.type = "attribute"
    }

    static get defaultOptions() {
        let options = super.defaultOptions;
        options.template = "systems/newedo/templates/dialog/feature/feature-attribute.hbs";

        return options;
    }
}