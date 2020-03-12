export class BgsHeroStat {
	readonly id: string;
	readonly popularity: number;
	readonly playerPopularity: number;
	readonly averagePosition: number;
	readonly playerAveragePosition: number;

	public static create(base: BgsHeroStat): BgsHeroStat {
		return Object.assign(new BgsHeroStat(), base);
	}
}
