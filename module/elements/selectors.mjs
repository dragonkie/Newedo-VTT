import { NEWEDO } from "../config.mjs";

export function DamageTypes(value, name) {
    return foundry.applications.fields.createSelectInput({
        options: [
            { value: "kin", label: "NEWEDO.damage.kin" },
            { value: "ele", label: "NEWEDO.damage.ele" },
            { value: "bio", label: "NEWEDO.damage.bio" },
            { value: "arc", label: "NEWEDO.damage.arc" }
        ],
        value: value,
        valueAttr: "value",
        labelAttr: "label",
        localize: true,
        sort: false,
        name: name
    }).outerHTML;
}

export function Traits(value, name) {
    return foundry.applications.fields.createSelectInput({
        options: [
            { value: "hrt", label: "NEWEDO.trait.core.hrt" },
            { value: "pow", label: "NEWEDO.trait.core.pow" },
            { value: "ref", label: "NEWEDO.trait.core.ref" },
            { value: "sav", label: "NEWEDO.trait.core.sav" },
            { value: "pre", label: "NEWEDO.trait.core.pre" },
            { value: "per", label: "NEWEDO.trait.core.per" },
            { value: "shi", label: "NEWEDO.trait.core.shi" },
        ],
        value: value,
        valueAttr: "value",
        labelAttr: "label",
        localize: true,
    }).outerHTML;
}

export function Skills(value, name) {
    let options = [];
    for (const [trait, skills] of Object.entries(NEWEDO.skill)) {
        for (const [key, skill] of Object.entries(skills)) {
            options.push({
                label: skill,
                value: key,
            })
        }
    }

    options.sort((a, b) => {
        if (a.value > b.value) return 1;
        if (a.value < b.value) return -1;
        return 0;
    });

    return foundry.applications.fields.createSelectInput({
        options: options,
        value: value,
        valueAttr: "value",
        labelAttr: "label",
        localize: true,
        sort: true,
        name: name
    }).outerHTML;
}

export function WeaponSkills(value, name) {
    return foundry.applications.fields.createSelectInput({
        options: [
            { value: "lightmelee", group: 'NEWEDO.generic.melee', label: "NEWEDO.skill.meleeLight" },
            { value: "heavymelee", group: 'NEWEDO.generic.melee', label: "NEWEDO.skill.meleeHeavy" },
            { value: "unarmed", group: 'NEWEDO.generic.melee', label: "NEWEDO.skill.unarmed" },
            { value: "thrown", group: 'NEWEDO.generic.melee', label: "NEWEDO.skill.thrown" },
            { value: "archery", group: 'NEWEDO.generic.ranged', label: "NEWEDO.skill.archery" },
            { value: "gunnery", group: 'NEWEDO.generic.ranged', label: "NEWEDO.skill.gunnery" },
            { value: "smallarms", group: 'NEWEDO.generic.ranged', label: "NEWEDO.skill.smallarms" },
        ],
        value: value,
        valueAttr: "value",
        labelAttr: "label",
        localize: true,
        sort: true,
        name: name
    }).outerHTML;
}
