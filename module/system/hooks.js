//import * as newHooks from "../hooks/something.js";
import {default as actorHooks} from "../hooks/actor.js";

export default function registerHooks() {
    actorHooks();
}