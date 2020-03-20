import { BgsPanel } from '../bgs-panel';
import { BgsPanelId } from '../bgs-panel-id.type';
import { BgsPostMatchStats } from './bgs-post-match-stats';

export class BgsPostMatchStatsPanel implements BgsPanel {
	readonly id: BgsPanelId = 'bgs-post-match-stats';
	readonly name: string = 'Post-match stats';
	readonly icon: string;
	readonly stats: BgsPostMatchStats;

	public static create(base: BgsPostMatchStatsPanel): BgsPostMatchStatsPanel {
		return Object.assign(new BgsPostMatchStatsPanel(), base);
	}
}
