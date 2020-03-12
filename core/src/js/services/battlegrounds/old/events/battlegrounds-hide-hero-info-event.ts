import { BattlegroundsEvent } from '../../store/events/_battlegrounds-event';

export class BattlegroundsHideHeroInfoEvent extends BattlegroundsEvent {
	constructor() {
		super('BattlegroundsHideHeroInfoEvent');
	}
}
