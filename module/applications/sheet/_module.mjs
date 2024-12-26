import * as ActorSheets from "./actor/_module.mjs";
import * as ItemSheets from "./item/_module.mjs";
import NewedoActorSheet from "./actor.mjs";
import NewedoItemSheet from "./item.mjs";
import NewedoSheetMixin from "./mixin.mjs";

const sheet = {
    mixin: NewedoSheetMixin,
    actor: {
        NewedoActorSheet,
        ...ActorSheets
    },
    item: {
        NewedoItemSheet,
        ...ItemSheets
    }
}

export default sheet;