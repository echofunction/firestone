import { BgsPanel } from '../bgs-panel';
import { BgsPanelId } from '../bgs-panel-id.type';
import { BgsPlayer } from '../bgs-player';
import { BgsStats } from '../stats/bgs-stats';
import { BgsPostMatchStats } from './bgs-post-match-stats';
import { BgsStatsFilterId } from './bgs-stats-filter-id.type';

export class BgsPostMatchStatsPanel implements BgsPanel {
	readonly id: BgsPanelId = 'bgs-post-match-stats';
	readonly name: string = 'Post-match stats';
	readonly icon: string;
	readonly stats: BgsPostMatchStats;
	readonly globalStats: BgsStats;
	readonly player: BgsPlayer;
	readonly selectedStat: BgsStatsFilterId;

	public static create(base: BgsPostMatchStatsPanel): BgsPostMatchStatsPanel {
		return Object.assign(new BgsPostMatchStatsPanel(), base);
	}

	public update(base: BgsPostMatchStatsPanel): BgsPostMatchStatsPanel {
		return Object.assign(new BgsPostMatchStatsPanel(), this, base);
	}
}
