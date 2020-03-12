import { BattlegroundsEvent } from '../../store/events/_battlegrounds-event';

export class BattlegroundsShowHeroInfoEvent extends BattlegroundsEvent {
	constructor(public readonly cardId: string) {
		super('BattlegroundsShowHeroInfoEvent');
	}
}
