import NewedoDialog from "./edo-dialog";

export class NewedoRollDialog extends NewedoDialog {
    constructor(rollData, actor, item, options) {
        LOGGER.debug(`Newedo roll dialog created`);

        super(rollData, options);

        this.actor = actor;
        this.item = item;
    }
}