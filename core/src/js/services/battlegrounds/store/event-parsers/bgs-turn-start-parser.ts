import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsGame } from '../../../../models/battlegrounds/bgs-game';
import { BgsHeroSelectionDoneEvent } from '../events/bgs-hero-selection-done-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { EventParser } from './_event-parser';

export class BgsTurnStartParser implements EventParser {
	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BgsTurnStartParser';
	}

	public async parse(
		currentState: BattlegroundsState,
		event: BgsHeroSelectionDoneEvent,
	): Promise<BattlegroundsState> {
		return currentState.update({
			currentGame: currentState.currentGame.update({
				currentTurn: currentState.currentGame.currentTurn + 1,
			} as BgsGame),
		} as BattlegroundsState);
	}
}
