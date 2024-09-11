import LOGGER from "../helpers/logger.mjs"
import sysUtils from "../helpers/sysUtil.mjs"

export default class NewedoDialog extends foundry.applications.api.DialogV2 {
    constructor(dialogData, options) {
        super(dialogData, options);
    }

    static get defaultOptions() {
        LOGGER.trace("defaultOptions | CPRDialog | called.");
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: `systems/${game.system.id}/templates/dialog/cpr-default-prompt.hbs`,
            title: "CPR.global.generic.title",
            width: 400,
            height: "auto",
            resizable: true,
            closeOnSubmit: false,
            submitOnChange: true,
            submitOnClose: false,
            buttons: {
                confirm: {
                    icon: "fas fa-check",
                    label: SystemUtils.Localize("CPR.dialog.common.confirm"),
                    callback: (dialog) => dialog.confirmDialog(),
                },
                cancel: {
                    icon: "fas fa-times",
                    label: SystemUtils.Localize("CPR.dialog.common.cancel"),
                    callback: (dialog) => dialog.closeDialog(),
                },
            },
            buttonDefault: "confirm",
            overwriteButtons: false, // If calling showDialog with custom buttons, override defaults or not.
        });
    }

}