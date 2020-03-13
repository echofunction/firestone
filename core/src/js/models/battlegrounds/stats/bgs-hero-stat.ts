export class BgsHeroStat {
	readonly id: string;
	readonly name: string;
	readonly popularity: number;
	readonly playerPopularity: number;
	readonly averagePosition: number;
	readonly playerAveragePosition: number;
	readonly playerGamesPlayed: number;

	public static create(base: BgsHeroStat): BgsHeroStat {
		return Object.assign(new BgsHeroStat(), base);
	}
}
