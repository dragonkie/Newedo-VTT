import LOGGER from "../utility/logger.mjs";
/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export default function preloadHandlebarsTemplates() {
  LOGGER.log(`Registering handelbars templates`);
  const id = game.system.id;
  const partials = [
    // Character Partials
    `systems/${id}/templates/actor/character/parts/actor-features.hbs`,
    `systems/${id}/templates/actor/character/parts/actor-items.hbs`,
    `systems/${id}/templates/actor/character/parts/actor-spells.hbs`,
    `systems/${id}/templates/actor/character/parts/actor-effects.hbs`,

    // Character specific partials
    `systems/${id}/templates/actor/character/character-header.hbs`,
    `systems/${id}/templates/actor/character/character-augs.hbs`,
    `systems/${id}/templates/actor/character/character-bio.hbs`,
    `systems/${id}/templates/actor/character/character-fates.hbs`,
    `systems/${id}/templates/actor/character/character-magic.hbs`,
    `systems/${id}/templates/actor/character/character-skills.hbs`,
    `systems/${id}/templates/actor/character/character-traits.hbs`,
    `systems/${id}/templates/actor/character/character-panel.hbs`,
    `systems/${id}/templates/actor/character/character-equipment.hbs`,

    // Item sheets

    // Feature config
    `systems/${id}/templates/dialog/feature/feature-title.hbs`
  ];

  const paths = {};
  for ( const path of partials ) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`${id}.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }

  return loadTemplates(paths);
};
