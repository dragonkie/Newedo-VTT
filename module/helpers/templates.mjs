import LOGGER from "../utility/logger.mjs";
/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export default function preloadHandlebarsTemplates() {
  LOGGER.log(`Register handelbars partials`);
  return loadTemplates([
    // Actor partials.
    "systems/newedo/templates/actor/parts/actor-features.html",
    "systems/newedo/templates/actor/parts/actor-items.html",
    "systems/newedo/templates/actor/parts/actor-spells.html",
    "systems/newedo/templates/actor/parts/actor-effects.html",

    //character specific partials
    "systems/newedo/templates/actor/character/player-header.html",
    "systems/newedo/templates/actor/character/player-augs.html",
    "systems/newedo/templates/actor/character/player-bio.html",
    "systems/newedo/templates/actor/character/player-fates.html",
    "systems/newedo/templates/actor/character/player-magic.html",
    "systems/newedo/templates/actor/character/player-skills.html",
    "systems/newedo/templates/actor/character/player-traits.html",
  ]);
};
