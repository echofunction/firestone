import { GameTag } from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { BoardEntity } from './board-entity';
import { BgsBoard } from './in-game/bgs-board';
import { BgsComposition } from './in-game/bgs-composition';
import { BgsTavernUpgrade } from './in-game/bgs-tavern-upgrade';
import { BgsTriple } from './in-game/bgs-triple';

export class BgsPlayer {
	readonly cardId: string;
	readonly name: string;
	readonly isMainPlayer: boolean = false;
	readonly tavernUpgradeHistory: readonly BgsTavernUpgrade[] = [];
	readonly tripleHistory: readonly BgsTriple[] = [];
	readonly compositionHistory: readonly BgsComposition[] = [];
	readonly boardHistory: readonly BgsBoard[] = [];

	public static create(base: BgsPlayer): BgsPlayer {
		return Object.assign(new BgsPlayer(), base);
	}

	public update(base: BgsPlayer) {
		return Object.assign(new BgsPlayer(), this, base);
	}

	public getCurrentTavernTier(): number {
		return this.tavernUpgradeHistory.length === 0
			? 1
			: this.tavernUpgradeHistory[this.tavernUpgradeHistory.length - 1].tavernTier;
	}

	public getLastKnownBoardState(): readonly Entity[] {
		return this.boardHistory.length === 0 ? [] : this.boardHistory[this.boardHistory.length - 1].board;
	}

	public getLastBoardStateTurn(): number {
		return this.boardHistory.length === 0 ? undefined : this.boardHistory[this.boardHistory.length - 1].turn;
	}

	public buildBgsEntities(logEntities: readonly any[]): readonly BoardEntity[] {
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
