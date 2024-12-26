import CultureSheet from "./culture.mjs";
import RoteSheet from "./rote.mjs";
import WeaponSheet from "./weapon.mjs";
import SkillSheet from "./skill.mjs";
import LineageSheet from "./lineage.mjs";
import AugmentSheet from "./augment.mjs";
import ArmourSheet from "./armour.mjs";

export { default as ArmourSheet } from "./armour.mjs";
export { default as AugmentSheet } from "./augment.mjs";
export { default as CultureSheet } from "./culture.mjs";
export { default as LineageSheet } from "./lineage.mjs";
export { default as RoteSheet } from "./rote.mjs";
export { default as SkillSheet } from "./skill.mjs";
export { default as WeaponSheet } from "./weapon.mjs";

export const config = [{
    application: ArmourSheet,
    options: {
        label: "NEWEDO.ItemSheet.armour",
        types: ['armour']
    }
}, {
    application: AugmentSheet,
    options: {
        label: "NEWEDO.ItemSheet.augment",
        types: ['augment']
    }
}, {
    application: CultureSheet,
    options: {
        label: "NEWEDO.ItemSheet.culture",
        types: ['culture']
    }
}, {
    application: LineageSheet,
    options: {
        label: "NEWEDO.ItemSheet.lineage",
        types: ['lineage']
    }
}, {
    application: RoteSheet,
    options: {
        label: "NEWEDO.ItemSheet.rote",
        types: ['rote']
    }
}, {
    application: SkillSheet,
    options: {
        label: "NEWEDO.ItemSheet.skill",
        types: ['skill']
    }
}, {
    application: WeaponSheet,
    options: {
        label: "NEWEDO.ItemSheet.weapon",
        types: ['weapon']
    }
}]