import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BgsPostMatchStatsPanel } from '../../../models/battlegrounds/post-match/bgs-post-match-stats-panel';

declare var amplitude: any;

@Component({
	selector: 'bgs-post-match-stats',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/battlegrounds/post-match/bgs-post-match-stats.component.scss`,
	],
	template: `
		<div class="post-match">
			Here be the post match stats
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsPostMatchStatsComponent {
	private _panel: BgsPostMatchStatsPanel;

	@Input() set panel(value: BgsPostMatchStatsPanel) {
		this._panel = value;
	}
}
