export class BgsHeroOverview {
	readonly heroCardId: string;
	readonly name: string;
	readonly globalPopularity: number;
	readonly globalAveragePosition: number;
	readonly globalTop4: number;
	readonly globalTop1: number;
	readonly ownGamesPlayed: number;
	readonly ownPopularity: number;
	readonly ownAveragePosition: number;
	readonly ownTop4: number;
	readonly ownTop4Percentage: number;
	readonly ownTop1: number;
	readonly ownTop1Percentage: number;
	readonly tribesStat: readonly { tribe: string; percent: number }[];
	readonly warbandStats: readonly { turn: number; totalStats: number }[];

	public static create(base: BgsHeroOverview): BgsHeroOverview {
		return Object.assign(new BgsHeroOverview(), this, base);
	}
}
