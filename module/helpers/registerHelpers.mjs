export default function registerHelpers() {
    Handlebars.registerHelper('concat', function () {
        let outStr = '';
        for (let arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });
    Handlebars.registerHelper('ledger', (target, id, label) => {
        return `<a data-action="editLedger" data-target="${target}" data-id="${id}" data-label="${label}"><i class="fa-solid fa-memo-pad"></i></a>`
    });
    Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());
    // Math operations
    Handlebars.registerHelper('divide', (a, b) => a / b);
    Handlebars.registerHelper('multiply', (a, b) => a * b);
    Handlebars.registerHelper('addition', (a, b) => a + b);
    Handlebars.registerHelper('subtraction', (a, b) => a - b);
    Handlebars.registerHelper('percent', (a, b) => a / b * 100);
    Handlebars.registerHelper('disabled', (a) => a == true ? 'disabled' : '');
    // Selector element generators
    Handlebars.registerHelper('selectDamage', (v, n) => newedo.elements.select.DamageTypes(v, n));
    Handlebars.registerHelper('selectSkill', (v, n) => newedo.elements.select.Skills(v, n));
    Handlebars.registerHelper('selectWeaponSkill', (v, n) => newedo.elements.select.WeaponSkills(v, n));
    Handlebars.registerHelper('selectTrait', (v, n) => newedo.elements.select.Traits(v, n));

    Handlebars.registerHelper('isGM', () => game.user.isGM);
}