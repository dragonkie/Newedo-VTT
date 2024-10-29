import { NewedoSheetMixin } from "./base-sheet.mjs";
import * as ActorSheets from "./actor/_module.mjs";
import { ItemSheets, NewedoItemSheet } from "./item/_module.mjs";

import { default as NewedoApplication } from "./base-application.mjs";
import NewedoContextMenu from "./context-menu.mjs";
import NewedoLedger from "./ledger.mjs";

export const applications = {
    sheets: {
        actor: ActorSheets,
        item: ItemSheets,
        mixin: NewedoSheetMixin
    },
    NewedoApplication,
    NewedoContextMenu,
    NewedoLedger,
}