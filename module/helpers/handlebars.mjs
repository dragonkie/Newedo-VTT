import LOGGER from "./logger.mjs";

export function registerTemplates() {
    LOGGER.log(`Registering handelbars templates`);
    const id = game.system.id;
    const path = `systems/${id}/templates`;
    const partials = [

        //Sheet Partials
        `${path}/shared/tabs-nav.hbs`,
        `${path}/shared/tabs-content.hbs`,

        // Feature config
        `${path}/dialog/feature/feature-title.hbs`,

        // Dialog popups
        `${path}/dialog/parts/roll-options.hbs`,
    ];

    const paths = {};
    for (const path of partials) {
        paths[path.replace(".hbs", ".html")] = path;
        paths[`${id}.${path.split("/").pop().replace(".hbs", "")}`] = path;
    }

    return loadTemplates(paths);
};

export function registerHelpers() {
    Handlebars.registerHelper('ledger', (target, id, label) => {
        return `<a data-action="editLedger" data-target="${target}" data-id="${id}" data-label="${label}"><i class="fa-solid fa-memo-pad"></i></a>`
    });
    Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());
    Handlebars.registerHelper('isGM', () => game.user.isGM);
    /* -------------------------------------------- */
    /*  Math helpers                                */
    /* -------------------------------------------- */
    Handlebars.registerHelper('divide', (a, b) => a / b);
    Handlebars.registerHelper('multiply', (a, b) => a * b);
    Handlebars.registerHelper('addition', (a, b) => a + b);
    Handlebars.registerHelper('subtraction', (a, b) => a - b);
    Handlebars.registerHelper('percent', (a, b) => a / b * 100);
    Handlebars.registerHelper('disabled', (a) => a == true ? 'disabled' : '');

    /* -------------------------------------------- */
    /*  Selector elements                           */
    /* -------------------------------------------- */
    Handlebars.registerHelper('selectDamage', (v, n) => newedo.elements.select.DamageTypes(v, n));
    Handlebars.registerHelper('selectSkill', (v, n) => newedo.elements.select.Skills(v, n));
    Handlebars.registerHelper('selectWeaponSkill', (v, n) => newedo.elements.select.WeaponSkills(v, n));
    Handlebars.registerHelper('selectTrait', (v, n) => newedo.elements.select.Traits(v, n));
}