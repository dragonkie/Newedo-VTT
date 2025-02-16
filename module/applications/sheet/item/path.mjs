import { NEWEDO } from "../../../config.mjs";
import sysUtil from "../../../helpers/sysUtil.mjs";
import NewedoApplication from "../../application.mjs";
import NewedoDialog from "../../dialog.mjs";
import { FeatureApp } from "../../feature.mjs";
import NewedoItemSheet from "../item.mjs";

export default class PathSheet extends NewedoItemSheet {
    static DEFAULT_OPTIONS = {
        actions: {
            createFeature: this._onCreateFeature,
            editFeature: this._onEditFeature,
            deleteFeature: this._onDeleteFeature,
            collapse: this._onCollapse,
        }
    }

    static get PARTS() {
        const p = super.PARTS
        p.settings = { template: "systems/newedo/templates/item/settings/path.hbs" };
        return p;
    }

    async _prepareContext() {
        const context = await super._prepareContext();
        const actor = this.actor;

        context.features = this.document.system.features;

        return context;
    }

    static async _onCreateFeature() {
        // Create the feature selection dialog
        const feature = await FeatureApp.create();
        const list = sysUtil.duplicate(this.document.system.features);
        list.push(feature);
        await this.document.update({ 'system.features': list });
    }

    /**
     * Creates a dialog box for editing a feature
     * @param {Event} event 
     * @param {Element} target 
     */
    static async _onEditFeature(event, target) {
        const id = +target.closest('.feature').dataset.featureId;
        const list = this.document.system.features;
        const feature = await FeatureApp.edit(list[id]);

        list[id] = feature;
        this.document.update({ 'system.features': list });
    }

    static async _onCollapse(event, target) {
        const el = target.closest('.feature');
        el.classList.toggle('expanded');

    }

    static async _onDeleteFeature(event, target) {
        const id = +target.closest('[data-feature-id]').dataset.featureId;

        try {
            const confirm = await NewedoDialog.confirm({
                window: { title: 'Delete Feature' },
                content: "<p>Are you sure you'd like to delete this feature?</p>"
            });
            if (!confirm) return;
            const list = this.document.system.features;
            list.splice(id, 1);
            await this.document.update({ 'system.features': list });
        } catch {
            return;
        }
    }
}