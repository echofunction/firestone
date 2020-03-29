import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BgsHeroOverview } from '../../../models/battlegrounds/hero-selection/bgs-hero-overview';
import { BgsHeroSelectionOverview } from '../../../models/battlegrounds/hero-selection/bgs-hero-selection-overview';
import { BgsHeroTier } from '../../../models/battlegrounds/stats/bgs-hero-stat';
import { groupByFunction } from '../../../services/utils';

declare var amplitude: any;

@Component({
	selector: 'bgs-hero-selection-overview',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/battlegrounds/hero-selection/bgs-hero-selection-overview.component.scss`,
		`../../../../css/global/scrollbar.scss`,
	],
	template: `
		<div class="container">
			<div class="left">
				<bgs-hero-tier *ngFor="let tier of tiers" [tier]="tier"></bgs-hero-tier>
			</div>
			<div class="hero-selection-overview">
				<bgs-hero-overview
					*ngFor="let hero of heroOverviews"
					[hero]="hero"
					[style.width.%]="getOverviewWidth()"
				></bgs-hero-overview>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsHeroSelectionOverviewComponent {
	heroOverviews: readonly BgsHeroOverview[];
	smallOverviews: readonly BgsHeroOverview[];
	tiers: { tier: BgsHeroTier; heroes: readonly BgsHeroOverview[] }[] = [];
	_panel: BgsHeroSelectionOverview;

	// TODO: tooltip on heroes
	@Input() set panel(value: BgsHeroSelectionOverview) {
		this._panel = value;
		const allOverviews = this._panel.heroOverview.filter(overview => overview.heroCardId !== 'average');
		const groupingByTier = groupByFunction((overview: BgsHeroOverview) => overview.tier);
		const groupedByTier: BgsHeroOverview[][] = Object.values(groupingByTier(allOverviews));
		console.log('groupedByTier', groupedByTier);
		this.tiers = [
			{
				tier: 'S' as BgsHeroTier,
				heroes: groupedByTier
					.find(heroes => heroes.find(hero => hero.tier === 'S'))
					?.sort((a, b) => a.globalAveragePosition - b.globalAveragePosition),
			},
			{
				tier: 'A' as BgsHeroTier,
				heroes: groupedByTier
					.find(heroes => heroes.find(hero => hero.tier === 'A'))
					?.sort((a, b) => a.globalAveragePosition - b.globalAveragePosition),
			},
			{
				tier: 'B' as BgsHeroTier,
				heroes: groupedByTier
					.find(heroes => heroes.find(hero => hero.tier === 'B'))
					?.sort((a, b) => a.globalAveragePosition - b.globalAveragePosition),
			},
			{
				tier: 'C' as BgsHeroTier,
				heroes: groupedByTier
					.find(heroes => heroes.find(hero => hero.tier === 'C'))
					?.sort((a, b) => a.globalAveragePosition - b.globalAveragePosition),
			},
			{
				tier: 'D' as BgsHeroTier,
				heroes: groupedByTier
					.find(heroes => heroes.find(hero => hero.tier === 'D'))
					?.sort((a, b) => a.globalAveragePosition - b.globalAveragePosition),
			},
		].filter(tier => tier.heroes);
		this.heroOverviews = this._panel.heroOptionCardIds
			.map(cardId => this._panel.heroOverview.find(overview => overview.heroCardId === cardId))
			// Add null-safe in case the heroes have been updated but not the code
			.filter(hero => hero);
	}

	getOverviewWidth(): number {
		switch (this._panel.heroOptionCardIds.length) {
			case 2:
				return 45;
			case 3:
				return 30;
			case 4:
				return 24;
		}
	}

	isAvailableHero(hero: BgsHeroOverview): boolean {
		return this.heroOverviews.map(h => h.heroCardId).indexOf(hero.heroCardId) !== -1;
	}
}
