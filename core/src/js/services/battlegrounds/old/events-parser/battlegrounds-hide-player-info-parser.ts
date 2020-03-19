import { BattlegroundsState } from '../../../../models/battlegrounds/old/battlegrounds-state';
import { EventParser } from '../../events-parser/event-parser';
import { BattlegroundsEvent } from '../../events/battlegrounds-event';
import { BattlegroundsHidePlayerInfoEvent } from '../events/battlegrounds-hide-player-info-event';

export class BattlegroundsHidePlayerInfoParser implements EventParser {
	public applies(gameEvent: BattlegroundsEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BattlegroundsHidePlayerInfoEvent';
	}

	public async parse(
		currentState: BattlegroundsState,
		event: BattlegroundsHidePlayerInfoEvent,
	): Promise<BattlegroundsState> {
		return currentState.update({ displayedPlayerCardId: null } as BattlegroundsState);
	}

	public event() {
		return 'BATTLEGROUNDS_HIDE_PLAYER_INFO';
	}
}