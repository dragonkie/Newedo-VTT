import LOGGER from "./logger.mjs";
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

    //Sheet Partials
    `${path}/shared/tabs-nav.hbs`,
    `${path}/shared/tabs-content.hbs`,

    // Feature config
    `${path}/dialog/feature/feature-title.hbs`,

    // Dialog popups
    `${path}/dialog/parts/roll-options.hbs`,
  ];

  const paths = {};
  for ( const path of partials ) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`${id}.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }

  return loadTemplates(paths);
};
