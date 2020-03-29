export class BgsHeroStat {
	readonly id: string;
	readonly name: string;
	readonly popularity: number;
	readonly averagePosition: number;
	readonly top4: number;
	readonly top1: number;
	readonly tier: BgsHeroTier;
	readonly playerPopularity: number;
	readonly playerAveragePosition: number;
	readonly playerGamesPlayed: number;
	readonly playerTop4: number;
	readonly playerTop1: number;
	readonly tribesStat: readonly { tribe: string; percent: number }[];
	readonly warbandStats: readonly { turn: number; totalStats: number }[];

	public static create(base: BgsHeroStat): BgsHeroStat {
		return Object.assign(new BgsHeroStat(), base);
	}
}

export type BgsHeroTier = 'S' | 'A' | 'B' | 'C' | 'D';
