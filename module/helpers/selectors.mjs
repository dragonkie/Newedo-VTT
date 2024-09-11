import { NEWEDO } from "../config.mjs";

export default class selectors {
    static DamageTypes(value, name) {
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

    static Traits(value, name) {
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
            sort: false,
            name: name
        }).outerHTML;
    }

    static Skills(value, name) {
        let options = [];
        for (const [trait, skills] of Object.entries(NEWEDO.skill)) {
            for (const [key, skill] of Object.entries(skills)) {
                options.push({
                    label: skill,
                    value: key,
                    group: 'NEWEDO.trait.core.' + trait
                })
            }
        }

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

    static WeaponSkills(value, name) {
        return foundry.applications.fields.createSelectInput({
            options: [
                { value: "light", group: 'NEWEDO.generic.melee', label: "NEWEDO.skill.meleeLight" },
                { value: "heavy", group: 'NEWEDO.generic.melee', label: "NEWEDO.skill.meleeHeavy" },
                { value: "unarmed",    group: 'NEWEDO.generic.melee', label: "NEWEDO.skill.unarmed" },
                { value: "thrown",     group: 'NEWEDO.generic.melee', label: "NEWEDO.skill.thrown" },
                { value: "archery",    group: 'NEWEDO.generic.ranged', label: "NEWEDO.skill.archery" },
                { value: "gunnery",    group: 'NEWEDO.generic.ranged', label: "NEWEDO.skill.gunnery" },
                { value: "smallarms",  group: 'NEWEDO.generic.ranged', label: "NEWEDO.skill.smallarms" },
            ],
            value: value,
            valueAttr: "value",
            labelAttr: "label",
            localize: true,
            sort: true,
            name: name
        }).outerHTML;
    }
}