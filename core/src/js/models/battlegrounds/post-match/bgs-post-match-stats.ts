import { BgsTavernUpgrade } from '../in-game/bgs-tavern-upgrade';
import { BgsTriple } from '../in-game/bgs-triple';
import { BgsCompositionForTurn } from './bgs-composition-for-turn';
import { NumericTurnInfo } from './numeric-turn-info';

export class BgsPostMatchStats {
	readonly tavernTimings: readonly BgsTavernUpgrade[];
	readonly tripleTimings: readonly BgsTriple[];
	readonly coinsWasted: number;
	readonly rerolls: number;

	readonly replayLink: string;

	readonly compositionsOverTurn: readonly BgsCompositionForTurn[];
	readonly rerollsOverTurn: readonly NumericTurnInfo[];
	readonly hpOverTurn: readonly NumericTurnInfo[];
	readonly leaderboardPositionOverTurn: readonly NumericTurnInfo[];
	readonly totalStatsOverTurn: readonly NumericTurnInfo[];

	readonly minionsKilled: number;
	readonly heroesTakenDown: number;
	readonly minionsBought: number;
	readonly minionsSold: number;
	readonly heroPowersUsed: number;
	readonly freezes: number;

	readonly percentageOfGoingFirst: number;

	public static create(base: BgsPostMatchStats): BgsPostMatchStats {
		return Object.assign(new BgsPostMatchStats(), base);
	}
}
