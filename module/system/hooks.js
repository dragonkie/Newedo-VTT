//import * as newHooks from "../hooks/something.js";

import * as debugHooks from "../hooks/testing-hooks.js";
import * as actorHooks from "../hooks/actor.js";

export default function registerHooks() {
    debugHooks.default();
    actorHooks.default();
}