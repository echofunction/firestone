import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostListener,
	OnDestroy,
	ViewEncapsulation,
	ViewRef,
} from '@angular/core';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BattlegroundsState } from '../../models/battlegrounds/battlegrounds-state';
import { DebugService } from '../../services/debug.service';
import { OverwolfService } from '../../services/overwolf.service';

declare var amplitude: any;

@Component({
	selector: 'battlegrounds',
	styleUrls: [
		`../../../css/global/components-global.scss`,
		`../../../css/component/battlegrounds/battlegrounds.component.scss`,
	],
	encapsulation: ViewEncapsulation.None,
	template: `
		<window-wrapper [activeTheme]="'achievements'" [allowResize]="true">
			<div class="controls">
				<control-bug></control-bug>
				<control-settings [windowId]="windowId"></control-settings>
				<control-discord></control-discord>
				<control-minimize [windowId]="windowId" [isMainWindow]="true"></control-minimize>
				<control-maximize [windowId]="windowId"></control-maximize>
				<control-close [windowId]="windowId"></control-close>
			</div>
			<battlegrounds-content [state]="state"> </battlegrounds-content>
			<ads [parentComponent]="'battlegrounds'"></ads>
		</window-wrapper>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsComponent implements AfterViewInit, OnDestroy {
	windowId: string;
	// activeTheme: CurrentAppType;
	state: BattlegroundsState;

	private isMaximized = false;
	private stateChangedListener: (message: any) => void;
	// private messageReceivedListener: (message: any) => void;
	private storeSubscription: Subscription;

	constructor(
		private readonly cdr: ChangeDetectorRef,
		private readonly ow: OverwolfService,
		private readonly debug: DebugService,
		private readonly cards: AllCardsService,
	) {
		cards.initializeCardsDb();
		// debug
		window['ow'] = this.ow;
	}

	async ngAfterViewInit() {
		this.cdr.detach();
		this.windowId = (await this.ow.getCurrentWindow()).id;
		console.log('windowId', this.windowId);
		this.stateChangedListener = this.ow.addStateChangedListener(OverwolfService.BATTLEGROUNDS_WINDOW, message => {
			console.log('received battlegrounds window message', message, this.isMaximized);
			// If hidden, restore window to as it was
			if (message.window_previous_state_ex === 'hidden') {
				console.log('window was previously hidden, keeping the previosu state', this.isMaximized);
			} else if (message.window_state === 'maximized') {
				this.isMaximized = true;
			} else if (message.window_state !== 'minimized') {
				// When minimized we want to remember the last position
				this.isMaximized = false;
			}
		});
		const storeBus: BehaviorSubject<BattlegroundsState> = this.ow.getMainWindow().battlegroundsStore;
		// console.log('retrieved storeBus');
		this.storeSubscription = storeBus.subscribe((newState: BattlegroundsState) => {
			// First update the state before restoring the window
			// console.log('received state', newState);
			this.state = newState;
			console.log('received state', this.state);
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		});
		this.positionWindowOnSecondScreen();
	}

	@HostListener('mousedown')
	dragMove() {
		console.log('moving?', this.isMaximized);
		if (!this.isMaximized) {
			this.ow.dragMove(this.windowId);
		}
	}

	ngOnDestroy(): void {
		this.ow.removeStateChangedListener(this.stateChangedListener);
		// this.ow.removeMessageReceivedListener(this.messageReceivedListener);
		this.storeSubscription.unsubscribe();
	}

	private async positionWindowOnSecondScreen() {
		const [monitorsList, gameInfo] = await Promise.all([this.ow.getMonitorsList(), this.ow.getRunningGameInfo()]);
		if (monitorsList.displays.length === 1) {
			return;
		}
		console.log('monitors', monitorsList);
		console.log('gameInfo', gameInfo);
		const mainMonitor = gameInfo?.monitorHandle?.value ?? -1;
		if (mainMonitor !== -1) {
			const secondMonitor = monitorsList.displays.filter(monitor => monitor.handle.value !== mainMonitor)[0];
			console.log('changing window position', this.windowId, secondMonitor.x, secondMonitor.y);
			this.ow.changeWindowPosition(this.windowId, secondMonitor.x + 10, secondMonitor.y + 10);
		}

		// this.ow.maximizeWindow(this.windowId);
	}
}
