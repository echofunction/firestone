import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsGame } from '../../../../models/battlegrounds/bgs-game';
import { BgsPlayer } from '../../../../models/battlegrounds/bgs-player';
import { BgsOpponentRevealedEvent } from '../events/bgs-opponent-revealed-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { EventParser } from './_event-parser';

export class BgsOpponentRevealedParser implements EventParser {
	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BgsOpponentRevealedEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsOpponentRevealedEvent): Promise<BattlegroundsState> {
		const newPlayer: BgsPlayer = BgsPlayer.create({
			cardId: event.cardId,
		} as BgsPlayer);
		const newGame = currentState.currentGame.update({
			players: [...currentState.currentGame.players, newPlayer] as readonly BgsPlayer[],
		} as BgsGame);
		return currentState.update({
			currentGame: newGame,
		} as BattlegroundsState);
	}
}
