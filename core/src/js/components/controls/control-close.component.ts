import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { CloseMainWindowEvent } from '../../services/mainwindow/store/events/close-main-window-event';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';
import { OverwolfService } from '../../services/overwolf.service';

declare let amplitude;

@Component({
	selector: 'control-close',
	styleUrls: [
		`../../../css/global/components-global.scss`,
		`../../../css/component/controls/controls.scss`,
		`../../../css/component/controls/control-close.component.scss`,
	],
	template: `
		<button confirmationTooltip [askConfirmation]="askConfirmation" (onConfirm)="closeWindow()">
			<svg class="svg-icon-fill">
				<use
					xmlns:xlink="https://www.w3.org/1999/xlink"
					xlink:href="/Files/assets/svg/sprite.svg#window-control_close"
				></use>
			</svg>
		</button>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlCloseComponent implements AfterViewInit {
	@Input() windowId: string;
	@Input() closeAll: boolean;
	@Input() isMainWindow: boolean;
	@Input() shouldHide: boolean;
	@Input() askConfirmation: boolean;
	@Input() eventProvider: () => void;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(private ow: OverwolfService) {}

	ngAfterViewInit() {
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
	}

	async closeWindow() {
		const windowName = (await this.ow.getCurrentWindow()).name;
		amplitude.getInstance().logEvent('close', { 'window': windowName });

		if (this.isMainWindow) {
			this.stateUpdater.next(new CloseMainWindowEvent());
		}
		// Delegate all the logic
		// If game is not running, we close all other windows
		const isRunning: boolean = await this.ow.inGame();
		// Temp
		const [mainWindow, bgsWindow] = await Promise.all([
			this.ow.getWindowState(OverwolfService.COLLECTION_WINDOW),
			this.ow.getWindowState(OverwolfService.BATTLEGROUNDS_WINDOW),
		]);
		const areBothMainAndBgWindowsOpen =
			mainWindow.window_state_ex !== 'closed' &&
			mainWindow.window_state_ex !== 'hidden' &&
			bgsWindow.window_state_ex !== 'closed' &&
			bgsWindow.window_state_ex !== 'hidden';
		if (this.closeAll && !isRunning && !areBothMainAndBgWindowsOpen) {
			console.log('[control-close] closing all app windows');
			this.ow.hideWindow(this.windowId);
			const openWindows = await this.ow.getOpenWindows();
			for (const [name] of Object.entries(openWindows)) {
				this.ow.closeWindowFromName(name);
			}
		} else if (this.eventProvider) {
			console.log('delegating closing logic');
			this.eventProvider();
			return;
		} else {
			console.log('[control-close] requested window close', this.windowId);
			if (this.shouldHide) {
				this.ow.hideWindow(this.windowId);
			} else if (this.isMainWindow) {
				this.ow.hideCollectionWindow();
			} else {
				this.ow.closeWindow(this.windowId);
			}
		}
	}
}
