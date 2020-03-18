import { GameTag } from '@firestone-hs/reference-data';
import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsGame } from '../../../../models/battlegrounds/bgs-game';
import { BgsPlayer } from '../../../../models/battlegrounds/bgs-player';
import { BoardEntity } from '../../../../models/battlegrounds/board-entity';
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
		const newHistory: readonly BgsBoard[] = [
			...playerToUpdate.boardHistory,
			BgsBoard.create({
				board: this.buildBgsEntities(event.board),
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

	private buildBgsEntities(logEntities: readonly any[]): readonly BoardEntity[] {
		return logEntities.map(entity => this.buildBgsEntity(entity));
	}

	private buildBgsEntity(logEntity): BoardEntity {
		return {
			cardId: logEntity.CardId,
			attack: logEntity.Tags.find(tag => tag.Name === GameTag.ATK)?.Value,
			divineShield: (logEntity.Tags.find(tag => tag.Name === GameTag.DIVINE_SHIELD) || {})?.Value === 1,
			enchantments: this.buildEnchantments(logEntity.Enchantments),
			entityId: logEntity.Entity,
			health: logEntity.Tags.find(tag => tag.Name === GameTag.HEALTH)?.Value,
			poisonous: logEntity.Tags.find(tag => tag.Name === GameTag.POISONOUS)?.Value === 1,
			reborn: logEntity.Tags.find(tag => tag.Name === GameTag.REBORN)?.Value === 1,
			taunt: logEntity.Tags.find(tag => tag.Name === GameTag.TAUNT)?.Value === 1,
			cleave: undefined, // For now I'm not aware of any tag for this, so it's hard-coded in the simulator
			windfury: logEntity.Tags.find(tag => tag.Name === GameTag.WINDFURY)?.Value === 1,
			megaWindfury: logEntity.Tags.find(tag => tag.Name === GameTag.MEGA_WINDFURY)?.Value === 1,
		};
	}

	private buildEnchantments(
		enchantments: { EntityId: number; CardId: string }[],
	): readonly { cardId: string; originEntityId: number }[] {
		return enchantments.map(enchant => ({
			originEntityId: enchant.EntityId,
			cardId: enchant.CardId,
		}));
	}
}
