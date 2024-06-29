import LOGGER from "../../system/logger.mjs";
import FeatureConfig from "./feature.mjs";

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

    /**
     * Called when this form is submitted, this is how we pass the values into the data field of the 
     * Fills the this.data object with everything that was submitted from the form, then calls the
     * super function to actually parse and submit it back to the parent
     * @param {*} event 
     * @param {*} formdata 
     */
    _updateObject(event, formdata) {
        LOGGER.log(`Formdata`, formdata);
        this.data = {};
        for (let [key, value] of Object.entries(formdata)) {
            if (key != "label") this.data[key] = value
        }
        super._updateObject(event, formdata);
    }
}