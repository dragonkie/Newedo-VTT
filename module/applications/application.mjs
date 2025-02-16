import sysUtil from "../helpers/sysUtil.mjs"
let {HandlebarsApplicationMixin, ApplicationV2} = foundry.applications.api

export default class NewedoApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'newedo-app-{id}',
        tag: 'form',
        classes: ['newedo'],
        window: {
            frame: true,
            title: "New Window",
            icon: "fa-solid fa-note-sticky",
            minimizable: false,
            resizeable: true
        },
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        }
    }

    static get PARTS() {
        return {};
    }
}