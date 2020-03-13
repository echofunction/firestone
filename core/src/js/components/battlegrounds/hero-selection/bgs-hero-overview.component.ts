import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BgsHeroOverview } from '../../../models/battlegrounds/hero-selection/bgs-hero-overview';

declare var amplitude: any;

@Component({
	selector: 'bgs-hero-overview',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/battlegrounds/hero-selection/bgs-hero-overview.component.scss`,
	],
	template: `
		<div class="hero-overview">
			<img [src]="icon" class="portrait" />
			<div class="name">{{ _hero.name }}</div>
			<div class="stats">
				<div class="entry">
					<div class="player-value">
						{{ _hero.ownGamesPlayed }} games played ({{ _hero.ownPopularity }} %)
					</div>
					<div class="global-value">({{ _hero.globalPopularity }} % global)</div>
				</div>
				<div class="entry">
					<div class="player-value">{{ _hero.ownAveragePosition }} average position</div>
					<div class="global-value">({{ _hero.globalAveragePosition }} global)</div>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsHeroOverviewComponent {
	_hero: BgsHeroOverview;
	icon: string;

	@Input() set hero(value: BgsHeroOverview) {
		this._hero = value;
		this.icon = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${value.heroCardId}.jpg`;
	}
}
