import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsMatchStartEvent } from '../events/bgs-match-start-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { EventParser } from './_event-parser';

export class BgsMatchStartParser implements EventParser {
	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BgsMatchStartEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsMatchStartEvent): Promise<BattlegroundsState> {
		return currentState.update({
			inGame: true,
		} as BattlegroundsState);
	}
}
