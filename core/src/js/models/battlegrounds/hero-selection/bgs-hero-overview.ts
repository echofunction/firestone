export class BgsHeroOverview {
	readonly heroCardId: string;
	readonly name: string;
	readonly globalPopularity: number;
	readonly globalAveragePosition: number;
	readonly ownGamesPlayed: number;
	readonly ownPopularity: number;
	readonly ownAveragePosition: number;

	public static create(base: BgsHeroOverview): BgsHeroOverview {
		return Object.assign(new BgsHeroOverview(), this, base);
	}
}
