//import * as newHooks from "../hooks/something.js";
import {default as actorHooks} from "./actor.js";

export default function registerHooks() {
    actorHooks();
}