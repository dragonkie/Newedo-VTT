import ArmourSheet from "./armour.mjs";
import AugmentSheet from "./augment.mjs";
import CultureSheet from "./culture.mjs";
import FateSheet from "./fate.mjs";
import LineageSheet from "./lineage.mjs";
import PathSheet from "./path.mjs";
import RoteSheet from "./rote.mjs";
import SkillSheet from "./skill.mjs";
import WeaponSheet from "./weapon.mjs";

export { default as ArmourSheet } from "./armour.mjs";
export { default as AugmentSheet } from "./augment.mjs";
export { default as CultureSheet } from "./culture.mjs";
export { default as LineageSheet } from "./lineage.mjs";
export { default as RoteSheet } from "./rote.mjs";
export { default as SkillSheet } from "./skill.mjs";
export { default as WeaponSheet } from "./weapon.mjs";
export { default as PathSheet} from "./path.mjs";

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
    application: FateSheet,
    options: {
        label: "NEWEDO.ItemSheet.fate",
        types: ['fate']
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
}, {
    application: PathSheet,
    options: {
        label: "NEWEDO.ItemSheet.path",
        types: ['path']
    }
}]