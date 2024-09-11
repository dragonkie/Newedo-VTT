import sysUtil from "../helpers/sysUtil.mjs"
let {HandlebarsApplicationMixin, ApplicationV2} = foundry.applications.api

export default class NewedoApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'newedo-app-{id}',
        tag: 'form',
        classes: ['ledger', 'newedo'],
        window: {
            frame: true,
            positioned: true,
            title: "Ledger: {actor}'s {currency}",
            icon: "fa-solid fa-note-sticky",
            minimizable: false,
            resizeable: true
        },
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            top: 300,
            left: 300,
            width: 650,
            height: 500,
            scale: 1.0
        }
    }
}