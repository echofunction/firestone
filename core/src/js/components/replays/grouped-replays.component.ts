import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GroupedReplays } from '../../models/mainwindow/replays/grouped-replays';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';
import { OverwolfService } from '../../services/overwolf.service';
import { GameStat } from '../../models/mainwindow/stats/game-stat';

@Component({
	selector: 'grouped-replays',
	styleUrls: [`../../../css/global/menu.scss`, `../../../css/component/replays/grouped-replays.component.scss`],
	template: `
		<div class="grouped-replays">
			<div class="header">{{ header }}</div>
			<ul class="replays">
				<li *ngFor="let replay of _replays">
					<replay-info [replay]="replay"></replay-info>
				</li>
			</ul>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupedReplaysComponent implements AfterViewInit {
	header: string;
	_replays: readonly GameStat[];

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	@Input() set groupedReplays(value: GroupedReplays) {
		this.header = value.header;
		this._replays = value.replays;
	}

	constructor(private readonly logger: NGXLogger, private ow: OverwolfService) {}

	ngAfterViewInit() {
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
	}
}