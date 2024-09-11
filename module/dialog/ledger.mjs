import LOGGER from "../helpers/logger.mjs"
import sysUtils from "../helpers/sysUtil.mjs"
import NewedoDialog from "./dialog.mjs";

export default class NewedoLedger extends NewedoDialog {
    constructor(actor, propName, options) {

    }

    static get defaultOptions() {
        LOGGER.trace("defaultOptions | CPRLedger | called.");
        return foundry.utils.mergeObject(super.defaultOptions, {
            // The title is set in the constructor above.
            template: `systems/${newedo.id}/templates/dialog/cpr-ledger-form.hbs`,
            width: 600,
            height: 340,
            submitOnChange: false,
            closeOnSubmit: false,
        });
    }

    getData() {
        super.getData();
        const data = {
            total: this.total,
            ledgername: this.ledgername,
            contents: this.contents,
            isGM: game.user.isGM,
        };
        return data;
    }

    activateListeners(html) {
        LOGGER.trace("activateListeners | CPRLedger | called.");

        html
            .find(".delete-ledger-line")
            .click((event) => this._deleteLedgerLine(event));

        html
            .find(".ledger-edit-button")
            .click((event) => this._updateLedger(this.propName, event));

        super.activateListeners(html);
    }
}