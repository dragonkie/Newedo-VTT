import LOGGER from "../utility/logger.mjs";
/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export default function preloadHandlebarsTemplates() {
  LOGGER.log(`Registering handelbars templates`);
  const id = game.system.id;
  const path = `systems/${id}/templates`;
  const partials = [
    // Actor Partials
    `${path}/actor/character/parts/actor-features.hbs`,
    `${path}/actor/character/parts/actor-items.hbs`,
    `${path}/actor/character/parts/actor-spells.hbs`,
    `${path}/actor/character/parts/actor-effects.hbs`,

    // Character specific partials
    `${path}/actor/character/character-header.hbs`,
    `${path}/actor/character/character-augs.hbs`,
    `${path}/actor/character/character-bio.hbs`,
    `${path}/actor/character/character-fates.hbs`,
    `${path}/actor/character/character-magic.hbs`,
    `${path}/actor/character/character-skills.hbs`,
    `${path}/actor/character/character-traits.hbs`,
    `${path}/actor/character/character-panel.hbs`,
    `${path}/actor/character/character-equipment.hbs`,

    // Item sheets
    `${path}/item/parts/item-header.hbs`,
    `${path}/item/parts/item-rules.hbs`,

    // Feature config
    `${path}/dialog/feature/feature-title.hbs`,

    // Dialog popups
    `${path}/dialog/roll/parts/dialog-roll-part-options.hbs`,
  ];

  const paths = {};
  for ( const path of partials ) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`${id}.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }

  return loadTemplates(paths);
};
