import { BgsPanel } from '../bgs-panel';
import { BgsHeroOverview } from './bgs-hero-overview';

export class BgsHeroSelectionOverview implements BgsPanel {
	readonly id: string = 'bgs_hero_selection_overview';
	readonly name: string = 'Heroes Overview';
	readonly icon: string;
	readonly heroOverview: readonly BgsHeroOverview[];

	public static create(base: BgsHeroSelectionOverview): BgsHeroSelectionOverview {
		return Object.assign(new BgsHeroSelectionOverview(), base);
	}
}
