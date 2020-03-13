import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BgsHeroSelectionOverview } from '../../../models/battlegrounds/hero-selection/bgs-hero-selection-overview';

declare var amplitude: any;

@Component({
	selector: 'bgs-hero-selection-overview',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/battlegrounds/hero-selection/bgs-hero-selection-overview.component.scss`,
	],
	template: `
		<div class="hero-selection-overview">
			<bgs-hero-overview *ngFor="let hero of _panel.heroOverview" [hero]="hero"></bgs-hero-overview>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsHeroSelectionOverviewComponent {
	_panel: BgsHeroSelectionOverview;

	@Input() set panel(value: BgsHeroSelectionOverview) {
		this._panel = value;
	}
}
