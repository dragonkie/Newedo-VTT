/**
 * Quick overide of the default dialog system to give us more control
 * 
 * Noteable points
 * - The callback function on a button ALWAYS passes the html to the callback as its argument
 */
export default class NewedoDialog extends Dialog {
    constructor(data, options={}) {
        super(data, options);
    }
}