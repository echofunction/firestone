export class BgsHeroStat {
	readonly id: string;
	readonly name: string;
	readonly popularity: number;
	readonly playerPopularity: number;
	readonly averagePosition: number;
	readonly playerAveragePosition: number;
	readonly playerGamesPlayed: number;
	readonly tribesStat: readonly { tribe: string; percent: number }[];
	readonly warbandStats: readonly { turn: number; totalStats: number }[];

	public static create(base: BgsHeroStat): BgsHeroStat {
		return Object.assign(new BgsHeroStat(), base);
	}
}
