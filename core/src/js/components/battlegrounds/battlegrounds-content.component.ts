import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { BattlegroundsState } from '../../models/battlegrounds/battlegrounds-state';
import { BgsPanel } from '../../models/battlegrounds/bgs-panel';
import { BgsStage } from '../../models/battlegrounds/bgs-stage';
import { DebugService } from '../../services/debug.service';
import { OverwolfService } from '../../services/overwolf.service';

declare var amplitude: any;

@Component({
	selector: 'battlegrounds-content',
	styleUrls: [
		`../../../css/global/components-global.scss`,
		`../../../css/component/battlegrounds/battlegrounds-content.component.scss`,
	],
	template: `
		<div class="battlegrounds" *ngIf="_state">
			<section class="menu">
				<i class="i-117X33 gold-theme logo">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#logo" />
					</svg>
				</i>
				<div class="navigation">
					<div class="main-menu">
						<div *ngFor="let stage of _state.stages" class="stage-button">
							<span>{{ stage.name }}</span>
						</div>
					</div>
					<div class="secondary-menu" *ngIf="currentStage">
						<div *ngFor="let panel of currentStage.panels" class="panel-button">
							<span>{{ panel.name }}</span>
						</div>
					</div>
				</div>
			</section>
			<section class="content" *ngIf="currentPanel">
				<div class="title">{{ currentPanel.name }}</div>
				<ng-container [ngSwitch]="currentPanel.id">
					<bgs-hero-selection-overview *ngSwitchCase="'bgs-hero-selection-overview'" [panel]="currentPanel">
					</bgs-hero-selection-overview>
					<bgs-next-opponent-overview
						*ngSwitchCase="'bgs-next-opponent-overview'"
						[panel]="currentPanel"
						[game]="_state.currentGame"
					>
					</bgs-next-opponent-overview>
				</ng-container>
			</section>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsContentComponent {
	_state: BattlegroundsState;
	currentStage: BgsStage;
	currentPanel: BgsPanel;

	@Input() set state(value: BattlegroundsState) {
		this._state = value;
		this.currentStage = value?.stages?.find(stage => stage.id === value.currentStageId);
		this.currentPanel = this.currentStage?.panels?.find(panel => panel.id === value.currentPanelId);
		console.log('setting state', value, this.currentStage, this.currentPanel);
	}

	constructor(
		private readonly cdr: ChangeDetectorRef,
		private readonly ow: OverwolfService,
		private readonly debug: DebugService,
		private readonly cards: AllCardsService,
	) {}
}
