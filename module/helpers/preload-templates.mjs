import LOGGER from "../utility/logger.mjs";
/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export default function preloadHandlebarsTemplates() {
  LOGGER.log(`Registering handelbars templates oui`);
  return loadTemplates([
    // Character Partials
    `systems/${game.system.id}/templates/actor/character/parts/actor-features.html`,
    `systems/${game.system.id}/templates/actor/character/parts/actor-items.html`,
    `systems/${game.system.id}/templates/actor/character/parts/actor-spells.html`,
    `systems/${game.system.id}/templates/actor/character/parts/actor-effects.html`,

    //character specific partials
    `systems/${game.system.id}/templates/actor/character/character-header.html`,
    `systems/${game.system.id}/templates/actor/character/character-augs.html`,
    `systems/${game.system.id}/templates/actor/character/character-bio.html`,
    `systems/${game.system.id}/templates/actor/character/character-fates.html`,
    `systems/${game.system.id}/templates/actor/character/character-magic.html`,
    `systems/${game.system.id}/templates/actor/character/character-skills.html`,
    `systems/${game.system.id}/templates/actor/character/character-traits.html`,
    `systems/${game.system.id}/templates/actor/character/character-panel.html`,
    `systems/${game.system.id}/templates/actor/character/character-equipment.html`
  ]);
};
