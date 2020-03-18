import { BattlegroundsStoreEvent } from './_battlegrounds-store-event';

export class BgsTurnStartEvent extends BattlegroundsStoreEvent {
	constructor() {
		super('BgsTurnStartEvent');
	}
}
