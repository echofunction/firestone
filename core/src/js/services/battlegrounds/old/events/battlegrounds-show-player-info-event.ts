import { BattlegroundsEvent } from '../../store/events/_battlegrounds-event';

export class BattlegroundsShowPlayerInfoEvent extends BattlegroundsEvent {
	constructor(public readonly playerCardId: string) {
		super('BattlegroundsShowPlayerInfoEvent');
	}
}
