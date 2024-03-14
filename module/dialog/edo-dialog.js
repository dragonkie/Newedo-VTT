

export default class NewedoDialog extends Dialog {
    constructor(data, options) {
        super(data, options);
    }
}

function rollDialog() {
    let _dialogRoll = new Dialog({
        title: "Roll Test",
        content: `
            <div style="display: flex; flex-direction: row;">
                <span style="flex: 1 0">Formula</span> 
                <input style="flex: 2" type="text" placeholder="trait + skill"/>
            </div>
            <div style="display: flex; flex-direction: row;">
                <span style="flex: 1 0">Bonuses?</span> 
                <input style="flex: 2" type="text" placeholder="trait + skill"/>
            </div>
        `,
        buttons: {
            advantage: {
                icon: '<i class="fas fa-check"></i>',
                label: "Advantage",
                callback: () => console.log("roll advantage")
            },
            standard: {
                icon: '<i class="fas fa-times"></i>',
                label: "Normal",
                callback: () => console.log("Roll normally")
            },
            disadvantage: {
                icon: '<i class="fas fa-times"></i>',
                label: "Disadvantage",
                callback: () => console.log("Roll disadvantage")
            }
        },
        default: "two",
        render: html => console.log("Register interactivity in the rendered dialog"),
        close: html => console.log("This always is logged no matter which option is chosen"),
        dragDrop: [{ dragSelector: ".item", dropSelector: "droptest"}],
    });
    d.render(true);

    console.log(d);
}

