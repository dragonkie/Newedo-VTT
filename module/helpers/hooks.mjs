import LOGGER from "./logger.mjs";

export default function registerHooks() {

    /* -------------------------------------------- */
    /*  Ready Hook                                  */
    /* -------------------------------------------- */
    Hooks.once("ready", async () => {
        // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to

    });

    Hooks.on('renderChatLog', (log, ele, data) => {
        let list = ele[0].querySelector('#chat-log');
    });

    // Adds functionality to chat message buttons for combat
    Hooks.on('renderChatMessage', (msg, element, data) => {
        // Link damage roll button
        element[0].querySelector('input.damage-button')?.addEventListener('click', async () => {
            const item = await fromUuid(element[0].querySelector('input.damage-button').dataset.uuid);
            if (item.type != 'weapon') return;

            let attackData = msg.getFlag('newedo', 'attackData');
            item.system._onDamage(attackData);
        });

        // Link damage application buttons
        for (const e of element[0].querySelectorAll('a.apply-damage')) {
            e.addEventListener('click', async () => {
                if (!game.user.isGM) return;
                let target = await fromUuid(e.dataset?.target);
                if (!target) return;

                let damage = {};
                let damageData = e.closest('.damage-data');
                let attacker = await fromUuid(damageData.dataset.attacker);
                damage.total = +damageData.dataset.damageTotal;
                damage.type = damageData.dataset.damageType;

                LOGGER.debug('target', target);
                LOGGER.debug('damage', damage);
                LOGGER.debug('attacker', attacker);

                let damageCalc = document.createElement("div");
                damageCalc.style.display = "inline";
                let finalDamage = Math.max(damage.total - target.system.armour[damage.type].total, 0);
                damageCalc.textContent = `${finalDamage}`;

                target.update({'system.hp.value': target.system.hp.value - finalDamage});

                e.replaceWith(damageCalc);
            });
        };


    });
}