import LOGGER from "../../utility/logger.mjs";
import FeatureAttributeConfig from "./feature-attribute.js";
import FeatureItemConfig from "./feature-item.js";
import FeatureTraitConfig from "./feature-trait.js";


export default class FeatureCreate extends FormApplication {
    constructor(data, options={}) {
        super(data, options);
        if (!data.item) {
            LOGGER.debug(`Item wasnt provided to feature creator`);
            return undefined;
        }
        this.item = data.item;
    }

    /**
     * @override
     * sets new default options for these windows when theyre opened
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["newedo", "feature", "config"],
            template: "systems/newedo/templates/dialog/feature/feature-creator.hbs",
            width: 400,
            height: 400,
            submitOnChange: false,
            closeOnSubmit: true,
            dropKeyPath: null,
            dragDrop: []
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".button-trait").each((i, li) => {
            let handler = (ev) => {
                let f = new FeatureTraitConfig({item: this.item}).render(true);
                this.close();
            };
            handler.bind(this.item);
            li.addEventListener("click", handler);
        });

        html.find(".button-attribute").each((i, li) => {
            let handler = (ev) => {
                let f = new FeatureAttributeConfig({item: this.item}).render(true);
                this.close();
            };
            handler.bind(this.item);
            li.addEventListener("click", handler);
        });

        html.find(".button-item").each((i, li) => {
            let handler = (ev) => {
                let f = new FeatureItemConfig({item: this.item}).render(true);
                this.close();
            };
            handler.bind(this.item);
            li.addEventListener("click", handler);
        });
    }
}