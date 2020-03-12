import { BgsPanel } from '../bgs-panel';
import { BgsStage } from '../bgs-stage';

export class BgsHeroSelectionStage implements BgsStage {
	readonly id: 'hero-selection';
	readonly icon: null;
	readonly name: 'Hero Selection';
	readonly panels: readonly BgsPanel[];

	public static create(base: BgsHeroSelectionStage): BgsHeroSelectionStage {
		return Object.assign(new BgsHeroSelectionStage(), base);
	}
}
