import { Injectable } from '@angular/core';
import { AchievementsMonitor } from './achievement/achievements-monitor.service';
import { AchievementsNotificationService } from './achievement/achievements-notification.service';
import { AchievementsVideoCaptureService } from './achievement/achievements-video-capture.service';
import { AchievementsLocalDbService as AchievementsDb } from './achievement/indexed-db.service';
import { RemoteAchievementsService } from './achievement/remote-achievements.service';
import { CollectionManager } from './collection/collection-manager.service';
import { IndexedDbService } from './collection/indexed-db.service';
import { PackHistoryService } from './collection/pack-history.service';
import { PackMonitor } from './collection/pack-monitor.service';
import { PackStatsService } from './collection/pack-stats.service';
import { DebugService } from './debug.service';
import { DeckParserService } from './decktracker/deck-parser.service';
import { GameStateService } from './decktracker/game-state.service';
import { OverlayDisplayService } from './decktracker/overlay-display.service';
import { DevService } from './dev.service';
import { EndGameListenerService } from './endgame/end-game-listener.service';
import { CloseMainWindowEvent } from './mainwindow/store/events/close-main-window-event';
import { ShowMainWindowEvent } from './mainwindow/store/events/show-main-window-event';
import { MainWindowStoreService } from './mainwindow/store/main-window-store.service';
import { TwitchAuthService } from './mainwindow/twitch-auth.service';
import { MatchSummaryService } from './match-summary/match-summary.service';
import { OverwolfService } from './overwolf.service';
import { SettingsCommunicationService } from './settings/settings-communication.service';

declare var ga: any;

@Injectable()
export class AppBootstrapService {
	private static readonly STATES = ['INIT', 'READY'];
	private static readonly LOADING_SCREEN_DURATION = 10000;

	private currentState = 'INIT';
	private loadingWindowId: string;
	private loadingWindowShown = false;
	// Seomtimes multiple events can fire in a row, which leads to the app
	// trying to close windows several times in a row
	private closing = false;

	constructor(
		private store: MainWindowStoreService,
		private ow: OverwolfService,
		private twitchAuth: TwitchAuthService,
		private debugService: DebugService,
		private dev: DevService,
		private collectionDb: IndexedDbService,
		private achievementsDb: AchievementsDb,
		private packMonitor: PackMonitor,
		private packHistory: PackHistoryService,
		private achievementsMonitor: AchievementsMonitor,
		private init_AchievementsNotifications: AchievementsNotificationService,
		private achievementsVideoCaptureService: AchievementsVideoCaptureService,
		private packStatsService: PackStatsService,
		private achievementStatsService: RemoteAchievementsService,
		private collectionManager: CollectionManager,
		private deckParserService: DeckParserService,
		private gameStateService: GameStateService,
		private settingsCommunicationService: SettingsCommunicationService,
		private init_decktrackerDisplayService: OverlayDisplayService,
		private init_endGameListenerService: EndGameListenerService,
		private init_matchSummaryService: MatchSummaryService,
	) {}

	public async init() {
		console.log('in init');
		if (!this.loadingWindowShown) {
			console.log('initializing loading window');
			this.loadingWindowShown = true;
			const window = await this.ow.obtainDeclaredWindow('LoadingWindow');
			this.loadingWindowId = window.id;
			await this.ow.restoreWindow(this.loadingWindowId);
			await this.ow.hideWindow(this.loadingWindowId);
			const isRunning = await this.ow.inGame();
			if (isRunning) {
				this.showLoadingScreen();
			}
		}

		// Wait until DB has properly been upgraded when needed
		if (!this.collectionDb.dbInit) {
			setTimeout(() => {
				this.init();
			}, 200);
			return;
		}
		if (!this.achievementsDb.dbInit) {
			setTimeout(() => {
				this.init();
			}, 200);
			return;
		}
		console.log('app init starting');
		this.ow.addHotKeyPressedListener('collection', async hotkeyResult => {
			console.log('hotkey pressed', hotkeyResult);
			if (hotkeyResult.status === 'success') {
				const window = await this.ow.obtainDeclaredWindow(OverwolfService.COLLECTION_WINDOW);
				if (window.isVisible) {
					this.store.stateUpdater.next(new CloseMainWindowEvent());
					await this.ow.hideWindow(window.id);
				} else {
					this.closeWelcomeWindow();
					this.startApp(() => this.showCollectionWindow());
				}
			} else {
				console.log('could not trigger hotkey', hotkeyResult, this.currentState);
			}
		});
		this.ow.addGameInfoUpdatedListener(async (res: any) => {
			console.log('updated game status');
			if (this.exitGame(res) && !this.closing) {
				console.log('left game, closing app');
				setTimeout(() => {
					this.closeApp();
				}, 5000); // Give some time to the other windows to close
			} else if (await this.ow.inGame()) {
				console.log('game is running, showing loading screen');
				this.showLoadingScreen();
			}
		});
		const collectionWindow = await this.ow.obtainDeclaredWindow(OverwolfService.COLLECTION_WINDOW);
		await this.ow.restoreWindow(collectionWindow.id);
		await this.ow.hideWindow(collectionWindow.id);
		this.startApp();
		this.ow.addAppLaunchTriggeredListener(() => {
			this.startApp(() => this.showCollectionWindow());
		});
		const settingsWindow = await this.ow.obtainDeclaredWindow(OverwolfService.SETTINGS_WINDOW);
		await this.ow.restoreWindow(settingsWindow.id);
		await this.ow.hideWindow(settingsWindow.id);
		const matchStatsWindow = await this.ow.obtainDeclaredWindow(OverwolfService.MATCH_STATS_WINDOW);
		await this.ow.restoreWindow(matchStatsWindow.id);
		await this.ow.hideWindow(matchStatsWindow.id);
		ga('send', 'event', 'toast', 'start-app');
	}

	private async showLoadingScreen() {
		console.log('showing loading screen?', this.currentState, this.loadingWindowId);
		if (this.currentState === 'READY') {
			return;
		}
		const result = await this.ow.restoreWindow(this.loadingWindowId);
		this.closeWelcomeWindow();
		this.closeCollectionWindow();
		console.log('final restore for loadingwindow done', result);
		setTimeout(() => {
			this.notifyAbilitiesReady();
		}, AppBootstrapService.LOADING_SCREEN_DURATION);
	}

	private notifyAbilitiesReady() {
		this.currentState = 'READY';
		this.ow.sendMessage(this.loadingWindowId, 'ready', 'ready');
	}

	private async startApp(showWhenStarted?: Function) {
		const isRunning = await this.ow.inGame();
		console.log('are we in game?', isRunning);
		if (isRunning) {
			if (showWhenStarted) {
				showWhenStarted();
			}
		} else {
			const window = await this.ow.obtainDeclaredWindow(OverwolfService.COLLECTION_WINDOW);
			if (!window.isVisible) {
				this.showWelcomePage();
			}
		}
	}

	private async closeLoadingScreen() {
		const window = await this.ow.obtainDeclaredWindow(OverwolfService.LOADING_WINDOW);
		await this.ow.hideWindow(window.id);
	}

	private async closeWelcomeWindow() {
		const window = await this.ow.obtainDeclaredWindow(OverwolfService.WELCOME_WINDOW);
		this.ow.hideWindow(window.id);
	}

	private async closeCollectionWindow() {
		const window = await this.ow.obtainDeclaredWindow(OverwolfService.COLLECTION_WINDOW);
		this.ow.hideWindow(window.id);
	}

	private async showWelcomePage() {
		const window = await this.ow.obtainDeclaredWindow(OverwolfService.WELCOME_WINDOW);
		await this.ow.restoreWindow(window.id);
		this.closeLoadingScreen();
	}

	private async showCollectionWindow() {
		console.log('reading to show collection window');
		const window = await this.ow.obtainDeclaredWindow(OverwolfService.COLLECTION_WINDOW);
		this.store.stateUpdater.next(new ShowMainWindowEvent());
		await this.ow.restoreWindow(window.id);
		this.closeLoadingScreen();
	}

	private exitGame(gameInfoResult: any): boolean {
		return !gameInfoResult || !gameInfoResult.gameInfo || !gameInfoResult.gameInfo.isRunning;
	}

	private async closeApp() {
		this.closing = true;
		// Close all windows
		const windows = await this.ow.getOpenWindows();
		console.log('closing all windows', windows);
		for (const [name, window] of Object.entries(windows)) {
			// Close the main window last
			if (name !== OverwolfService.MAIN_WINDOW) {
				console.log('closing window', name, window);
				this.ow.closeWindowFromName(name);
			}
		}
		this.ow.closeWindowFromName(OverwolfService.MAIN_WINDOW);
	}
}