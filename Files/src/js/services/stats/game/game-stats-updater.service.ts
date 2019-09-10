import { EventEmitter, Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GameEvent } from '../../../models/game-event';
import { GameStat } from '../../../models/mainwindow/stats/game-stat';
import { GameStats } from '../../../models/mainwindow/stats/game-stats';
import { AllCardsService } from '../../all-cards.service';
import { GameParserService } from '../../endgame/game-parser.service';
import { GameEvents } from '../../game-events.service';
import { MainWindowStoreEvent } from '../../mainwindow/store/events/main-window-store-event';
import { RecomputeGameStatsEvent } from '../../mainwindow/store/events/stats/recompute-game-stats-event';

@Injectable()
export class GameStatsUpdaterService {
	// This is set directly by the store
	public stateUpdater: EventEmitter<MainWindowStoreEvent>;

	private currentGameStat: GameStat = undefined;

	constructor(
		private gameEvents: GameEvents,
		private cards: AllCardsService,
		private gameParserService: GameParserService,
		private logger: NGXLogger,
	) {
		this.init();
	}

	public recomputeGameStats(gameStats: GameStats): GameStats {
		// Build the new stat ourselves, as we have no way of being notified when
		// the new stat will be available on the remote db
		const gameStat: GameStat = this.buildGameStat();
		const newStats: readonly GameStat[] = [gameStat, ...gameStats.stats];
		this.logger.debug('[game-stats-updater] built new game stats', newStats);
		return Object.assign(new GameStats(), gameStats, {
			stats: newStats,
		} as GameStats);
	}

	private init() {
		this.gameEvents.allEvents.subscribe((event: GameEvent) => {
			if (event.type === GameEvent.GAME_START) {
				this.currentGameStat = new GameStat();
			} else if (event.type === GameEvent.FIRST_PLAYER) {
				this.currentGameStat = this.assignCoinPlay(event);
			} else if (event.type === GameEvent.MATCH_METADATA) {
				this.currentGameStat = this.assignMetadata(event);
			} else if (event.type === GameEvent.LOCAL_PLAYER) {
				this.currentGameStat = this.assignLocalPlayer(event);
			} else if (event.type === GameEvent.OPPONENT) {
				this.currentGameStat = this.assignOpponent(event);
			} else if (event.type === GameEvent.GAME_END) {
				this.stateUpdater.next(new RecomputeGameStatsEvent());
			}
		});
	}

	private assignCoinPlay(event: GameEvent): GameStat {
		const coinPlay = event.localPlayer.Id === event.entityId ? 'play' : 'coin';
		const newStat = Object.assign(new GameStat(), this.currentGameStat, {
			coinPlay: coinPlay,
		} as GameStat);
		this.logger.debug('[game-stats-updater] assigned coinPlay', this.currentGameStat);
		return newStat;
	}

	private assignMetadata(event: GameEvent): GameStat {
		this.logger.debug('[game-stats-updater] assigning metadata', event);
		const gameType = this.gameParserService.toGameType(event.additionalData.metaData.GameType);
		const formatType = this.gameParserService.toFormatType(event.additionalData.metaData.FormatType);
		const newStat = Object.assign(new GameStat(), this.currentGameStat, {
			gameMode: gameType,
			gameFormat: formatType,
		} as GameStat);
		this.logger.debug('[game-stats-updater] assigned meta data', this.currentGameStat);
		return newStat;
	}

	private assignLocalPlayer(event: GameEvent): GameStat {
		this.logger.debug('[game-stats-updater] assigning local player', event);
		const playerCardId = event.localPlayer.CardID;
		const playerClass = playerCardId ? this.cards.getCard(playerCardId).playerClass.toLowerCase() : undefined;
		const newStat = Object.assign(new GameStat(), this.currentGameStat, {
			playerClass: playerClass,
			playerCardId: playerCardId,
		} as GameStat);
		this.logger.debug('[game-stats-updater] assigned local player', this.currentGameStat);
		return newStat;
	}

	private assignOpponent(event: GameEvent): GameStat {
		this.logger.debug('[game-stats-updater] assigning opponent', event);
		const opponentCardId = event.opponentPlayer.CardID;
		const opponentClass = opponentCardId ? this.cards.getCard(opponentCardId).playerClass.toLowerCase() : undefined;
		const newStat = Object.assign(new GameStat(), this.currentGameStat, {
			opponentClass: opponentClass,
			opponentCardId: opponentCardId,
		} as GameStat);
		this.logger.debug('[game-stats-updater] assigned opponent', this.currentGameStat);
		return newStat;
	}

	private buildGameStat(): GameStat {
		return Object.assign(new GameStat(), this.currentGameStat, {
			creationTimestamp: Date.now(),
		} as GameStat);
	}
}