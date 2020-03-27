import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
} from '@angular/core';
import { BgsStageId } from '../../models/battlegrounds/bgs-stage-id.type';
import { BgsStageChangeEvent } from '../../services/battlegrounds/store/events/bgs-stage-change-event';
import { BattlegroundsStoreEvent } from '../../services/battlegrounds/store/events/_battlegrounds-store-event';
import { OverwolfService } from '../../services/overwolf.service';

declare var amplitude;

@Component({
	selector: 'menu-selection-bgs',
	styleUrls: [
		`../../../css/global/menu.scss`,
		`../../../css/component/battlegrounds/menu-selection-bgs.component.scss`,
	],
	template: `
		<ul class="menu-selection">
			<li
				[ngClass]="{ 'selected': selectedStage === 'hero-selection' }"
				(mousedown)="selectStage('hero-selection')"
			>
				<span>Hero Selection</span>
			</li>
			<li [ngClass]="{ 'selected': selectedStage === 'in-game' }" (mousedown)="selectStage('in-game')">
				<span>Opponent</span>
			</li>
			<li [ngClass]="{ 'selected': selectedStage === 'post-match' }" (mousedown)="selectStage('post-match')">
				<span>Post-Match Stats</span>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSelectionBgsComponent implements AfterViewInit {
	@Input() selectedStage: string;

	private battlegroundsUpdater: EventEmitter<BattlegroundsStoreEvent>;

	constructor(private ow: OverwolfService, private cdr: ChangeDetectorRef) {}

	async ngAfterViewInit() {
		this.battlegroundsUpdater = (await this.ow.getMainWindow()).battlegroundsUpdater;
	}

	selectStage(stage: BgsStageId) {
		this.battlegroundsUpdater.next(new BgsStageChangeEvent(stage));
	}
}
