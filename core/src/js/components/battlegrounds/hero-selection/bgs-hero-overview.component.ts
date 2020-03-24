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
				<div class="title">Stats</div>
				<div class="entry">
					<div class="player-value">
						{{ _hero.ownGamesPlayed }} played ({{ _hero.ownPopularity.toFixed(1) }} %)
					</div>
					<div class="global-value">({{ _hero.globalPopularity.toFixed(1) }} % global)</div>
				</div>
				<div class="entry">
					<div class="player-value">{{ _hero.ownAveragePosition.toFixed(1) }} average position</div>
					<div class="global-value">({{ _hero.globalAveragePosition.toFixed(1) }} global)</div>
				</div>
				<div class="entry">
					<div class="player-value">
						{{ _hero.ownTop4 }} top 4 ({{ _hero.ownTop4Percentage.toFixed(1) }} %)
					</div>
					<div class="global-value">({{ _hero.globalTop4.toFixed(1) }} % global)</div>
				</div>
				<div class="entry">
					<div class="player-value">
						{{ _hero.ownTop1 }} top 1 ({{ _hero.ownTop1Percentage.toFixed(1) }} %)
					</div>
					<div class="global-value">({{ _hero.globalTop1.toFixed(1) }} % global)</div>
				</div>
			</div>
			<div class="tribes">
				<div class="title">Winning warband tribes</div>
				<div class="composition">
					<div *ngFor="let tribe of tribes" class="tribe">
						<div class="icon">{{ tribe.tribe }}</div>
						<div class="value">{{ tribe.percent }}</div>
					</div>
				</div>
			</div>
			<div class="profile">
				<div class="title">Warband stats per turn</div>
				<bgs-hero-warband-stats [warbandStats]="warbandStats"></bgs-hero-warband-stats>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsHeroOverviewComponent {
	_hero: BgsHeroOverview;
	icon: string;
	tribes: readonly { tribe: string; percent: string }[];
	warbandStats: readonly { turn: number; totalStats: number }[];

	@Input() set hero(value: BgsHeroOverview) {
		this._hero = value;
		this.icon = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${value.heroCardId}.jpg`;
		this.tribes = [...value.tribesStat]
			.sort((a, b) => b.percent - a.percent)
			.map(stat => ({ tribe: stat.tribe, percent: stat.percent.toFixed(1) }))
			.slice(0, 4);
		this.warbandStats = value.warbandStats;
	}
}
