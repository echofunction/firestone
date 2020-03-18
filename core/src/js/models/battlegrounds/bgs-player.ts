import { BgsBoard } from './in-game/bgs-board';
import { BgsComposition } from './in-game/bgs-composition';
import { BgsTavernUpgrade } from './in-game/bgs-tavern-upgrade';
import { BgsTriple } from './in-game/bgs-triple';

export class BgsPlayer {
	readonly cardId: string;
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
}
