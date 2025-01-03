import LOGGER from "./logger.mjs";

export default function registerHooks() {

    /* -------------------------------------------- */
    /*  Ready Hook                                  */
    /* -------------------------------------------- */
    Hooks.once("ready", async () => {
        // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
        
    });

    Hooks.on('renderChatLog', (log, ele, data) => {
        console.log('RENDER CHAT LOG HOOK')
        let list = ele[0].querySelector('#chat-log');
    });

    // Adds functionality to chat message buttons
    Hooks.on('renderChatMessage', (msg, element, data) => {
        element[0].querySelector('input.damage-button')?.addEventListener('click', async () => {
            const item = await fromUuid(element[0].querySelector('input.damage-button').dataset.uuid);
            if (item.type != 'weapon') return;
            item.system._onDamage();
        })
    });
}