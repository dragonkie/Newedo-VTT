import FeatureConfig from "./feature.mjs";

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