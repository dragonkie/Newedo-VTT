import { FeatureTrait } from "../data/feature.mjs";
import NewedoDialog from "./dialog.mjs";
import sysUtil from "../helpers/sysUtil.mjs";

/*
CONTOLS ALL FEATURE DIALOG BOXS AND THEIR HANDLING
*/
export class FeatureApp extends NewedoDialog {
    static TEMPLATES = {
        CREATE: `systems/newedo/templates/dialog/feature/creator.hbs`,
        TRAIT: `systems/newedo/templates/dialog/feature/trait.hbs`,
        ITEM: `systems/newedo/templates/dialog/feature/item.hbs`,
        EFFECT: `systems/newedo/templates/dialog/feature/effect.hbs`,
    }

    static TYPES = [
        'trait',
        'item',
        'effect',
    ]

    /**
     * Creates a new feature of selected type from user input
     * @returns 
     */
    static async create() {

        // Wrapper to wait for the dialog box to be resolved for us
        const selection = await new Promise(async (resolve, reject) => {
            // creates the dialog input
            const app = await new FeatureApp({
                window: { title: 'Create New Feature' },
                content: await renderTemplate(this.TEMPLATES.CREATE),
                buttons: [{
                    label: 'Cancel',
                    action: 'cancel',
                    callback: () => { reject('user cancled') }
                }],
                close: () => { reject('user cancled') },
                submit: () => { },
                actions: {
                    featureTrait: () => {
                        resolve('trait');
                        app.close();
                    },
                    featureItem: () => {
                        resolve('item');
                        app.close();
                    },
                    featureEffect: () => {
                        resolve('effect');
                        app.close();
                    }
                }
            }).render(true);
        });

        // based of selection, augment the featyures data property
        switch (selection) {
            case 'trait':
                return new FeatureTrait();
            case 'item':

                break;
            case 'effect':

                break;
        }
    }

    static async open(feature) {
        return this.open(feature);
    }

    static async edit(feature) {
        switch (feature.type) {
            case 'trait':
                return this._onEditTrait(feature);
            case 'item':
                return this._onEditItem(feature);
            case 'effect':
                return this._onEditEffect(feature);
        }
        return null;
    }

    static async _onEditTrait(feature) {
        // protect the base feature from being modified accidently
        feature = sysUtil.duplicate(feature);

        // prepare render data for the template
        const renderData = {
            feature: feature
        }
        // Create the dialog box to open the feature from
        const app = await new Promise(async (resolve, reject) => {
            const dialog = await new FeatureApp({
                window: { title: 'Edit Feature' },
                content: await renderTemplate(this.TEMPLATES.TRAIT, renderData),
                buttons: [{
                    label: 'Cancel',
                    action: 'cancel',
                    callback: () => { 'cancel' }
                }, {
                    label: 'Confirm',
                    action: 'confirm',
                    callback: () => { 'submit' }
                }],
                close: () => { resolve({ status: 'cancel' }); },
                submit: (value) => {
                    // if user cancled, dont submit
                    if (value == 'cancel') resolve({ status: 'cancel' });
                    // Get the standard feature options and assign them
                    let options = dialog.element.querySelectorAll('[name]');
                    for (const o of options) {
                        feature[o.name] = o.value;
                        if (o.type == 'number') feature[o.name] = +o.value;
                    }
                    // Get the traits array
                    let dataArrays = dialog.element.querySelectorAll('[data-array-name]');
                    for (const a of dataArrays) {
                        feature.data.traits[a.dataset.arrayIndex].value = +a.value;
                    }
                    // Send back the edited feature
                    resolve(feature);
                },
            }).render(true);
        });
        // if user cancled, return empty handed
        if (app.status == 'cancel') return null;
        return feature;
    }
}
