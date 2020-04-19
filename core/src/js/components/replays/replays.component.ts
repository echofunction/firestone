import { ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { NavigationState } from '../../models/mainwindow/navigation/navigation-state';
import { ReplaysState } from '../../models/mainwindow/replays/replays-state';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';
import { OverwolfService } from '../../services/overwolf.service';

@Component({
	selector: 'replays',
	styleUrls: [
		`../../../css/component/app-section.component.scss`,
		`../../../css/component/replays/replays.component.scss`,
	],
	template: `
		<div class="app-section replays">
			<section class="main divider">
				<with-loading [isLoading]="state.isLoading">
					<global-header [navigation]="navigation" *ngIf="navigation.text"> </global-header>
					<replays-list
						[state]="state"
						[hidden]="navigation.navigationReplays.currentView !== 'list'"
					></replays-list>
					<match-details
						[state]="state"
						[navigation]="navigation.navigationReplays"
						[hidden]="navigation.navigationReplays.currentView !== 'match-details'"
					></match-details>
				</with-loading>
			</section>
			<section class="secondary"></section>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplaysComponent {
	@Input() navigation: NavigationState;
	@Input() state: ReplaysState;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(private readonly logger: NGXLogger, private ow: OverwolfService) {}

	ngAfterViewInit() {
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
	}
}
