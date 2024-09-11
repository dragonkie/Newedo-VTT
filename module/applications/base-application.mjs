import sysUtil from "../helpers/sysUtil.mjs"


export default class NewedoApplication extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: MyApp.formHandler,
            submitOnChange: false,
            closeOnSubmit: false,
        },
        actions: {
            cancel: this._onCancel,
            confirm: this._onConfirm,
            createTransaction: this._onTransaction,
            notify: this._onNotify
        },
        window: {
            controls: [
                {
                    icon: 'fa-gun',
                    label: 'Notfication',
                    action: 'notify'
                }
            ]
        }
    }

    _onRender(context, options) {
        _activateListeners();
    }

    _activateListeners() {
        
    }

    static _onCancel() {

    }

    static _onConfirm() {

    }

    static _onTransaction() {

    }

    static _onNotify() {
        sysUtil.notification('notified mother fucker!')
    }

    /** @override */
    _configureRenderOptions(options) {
        // Super populares the options.parts key and is neccessary
        super._configureRenderOptions(options);
        // We can overide the list of parts to change which ones are being rendered
        // This lets us change whats rendering based on who's looking
        /*
        options.parts =['header', 'settings']
        if (!gm) return;
        options.parts.push('secrets');
        */
    }

    _onRender() {

    }
}