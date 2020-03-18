import { GameTag } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { Map } from 'immutable';
import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsGame } from '../../../../models/battlegrounds/bgs-game';
import { BgsPlayer } from '../../../../models/battlegrounds/bgs-player';
import { BgsBoard } from '../../../../models/battlegrounds/in-game/bgs-board';
import { BgsPlayerBoardEvent } from '../events/bgs-player-board-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { EventParser } from './_event-parser';

export class BgsPlayerBoardParser implements EventParser {
	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BgsPlayerBoardEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsPlayerBoardEvent): Promise<BattlegroundsState> {
		const playerToUpdate = currentState.currentGame.players.find(player => player.cardId === event.heroCardId);
		console.log('finding player board', playerToUpdate, event, currentState);
		const newHistory: readonly BgsBoard[] = [
			...playerToUpdate.boardHistory,
			BgsBoard.create({
				board: this.buildEntities(event.board),
				turn: currentState.currentGame.currentTurn,
			}),
		];
		const newPlayer = playerToUpdate.update({
			boardHistory: newHistory,
		} as BgsPlayer);
		const newPlayers: readonly BgsPlayer[] = currentState.currentGame.players.map(player =>
			player.cardId === newPlayer.cardId ? newPlayer : player,
		);
		const newGame = currentState.currentGame.update({ players: newPlayers } as BgsGame);
		return currentState.update({
			currentGame: newGame,
		} as BattlegroundsState);
	}

	private buildEntities(logEntities: readonly any[]): readonly Entity[] {
		return logEntities.map(entity => this.buildEntity(entity));
	}

	private buildEntity(logEntity): Entity {
		return Object.assign(new Entity(), {
			cardID: logEntity.CardId,
			id: logEntity.Entity,
			tags: this.buildTags(logEntity.Tags),
		} as Entity);
	}

	private buildTags(tags: { Name: number; Value: number }[]): Map<string, number> {
		return Map(tags.map(tag => [GameTag[tag.Name], tag.Value]));
	}
}
