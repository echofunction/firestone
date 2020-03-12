import { BattlegroundsEvent } from '../../store/events/_battlegrounds-event';

export class BattlegroundsHidePlayerInfoEvent extends BattlegroundsEvent {
	constructor() {
		super('BattlegroundsHidePlayerInfoEvent');
	}
}
