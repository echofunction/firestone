import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BgsHeroOverview } from '../../../models/battlegrounds/hero-selection/bgs-hero-overview';
import { BgsHeroSelectionOverview } from '../../../models/battlegrounds/hero-selection/bgs-hero-selection-overview';

declare var amplitude: any;

@Component({
	selector: 'bgs-hero-selection-overview',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/battlegrounds/hero-selection/bgs-hero-selection-overview.component.scss`,
	],
	template: `
		<div class="container">
			<div class="left">
				<bgs-hero-mini
					*ngFor="let hero of smallOverviews"
					[hero]="hero"
					[ngClass]="{ 'available': isAvailableHero(hero) }"
				></bgs-hero-mini>
			</div>
			<div class="hero-selection-overview">
				<bgs-hero-overview *ngFor="let hero of heroOverviews" [hero]="hero"></bgs-hero-overview>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsHeroSelectionOverviewComponent {
	heroOverviews: readonly BgsHeroOverview[];
	smallOverviews: readonly BgsHeroOverview[];
	_panel: BgsHeroSelectionOverview;

	@Input() set panel(value: BgsHeroSelectionOverview) {
		this._panel = value;
		this.smallOverviews = this._panel.heroOverview.filter(overview => overview.heroCardId !== 'average');
		this.heroOverviews = this._panel.heroOptionCardIds
			.map(cardId => this._panel.heroOverview.find(overview => overview.heroCardId === cardId))
			// Add null-safe in case the heroes have been updated but not the code
			.filter(hero => hero);
	}

	isAvailableHero(hero: BgsHeroOverview): boolean {
		return this.heroOverviews.map(h => h.heroCardId).indexOf(hero.heroCardId) !== -1;
	}
}
