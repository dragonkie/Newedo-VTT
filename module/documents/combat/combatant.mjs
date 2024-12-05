import LOGGER from "../../helpers/logger.mjs";

export default class NewedoCombatant extends Combatant {
    /**@override */
    getInitiativeRoll(formula) {
        LOGGER.log('Combatant get initative formula: ', formula);
        return super.getInitiativeRoll(formula);
    }

    _onDelete(options, userId) {

    }
}