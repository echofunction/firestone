import { EventEmitter, Injectable } from '@angular/core';
import { GameType } from '@firestone-hs/reference-data';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { BehaviorSubject } from 'rxjs';
import { BattlegroundsState } from '../../../models/battlegrounds/battlegrounds-state';
import { GameEvent } from '../../../models/game-event';
import { Events } from '../../events.service';
import { GameEventsEmitterService } from '../../game-events-emitter.service';
import { OverwolfService } from '../../overwolf.service';
import { ProcessingQueue } from '../../processing-queue.service';
import { BattlegroundsResetBattleStateParser } from './event-parsers/battlegrounds-reset-battle-state-parser';
import { BgsGameEndParser } from './event-parsers/bgs-game-end-parser';
import { BgsHeroSelectedParser } from './event-parsers/bgs-hero-selected-parser';
import { BgsHeroSelectionDoneParser } from './event-parsers/bgs-hero-selection-done-parser';
import { BgsHeroSelectionParser } from './event-parsers/bgs-hero-selection-parser';
import { BgsInitParser } from './event-parsers/bgs-init-parser';
import { BgsMatchStartParser } from './event-parsers/bgs-match-start-parser';
import { BgsNextOpponentParser } from './event-parsers/bgs-next-opponent-parser';
import { BgsOpponentRevealedParser } from './event-parsers/bgs-opponent-revealed-parser';
import { BgsPlayerBoardParser } from './event-parsers/bgs-player-board-parser';
import { BgsStageChangeParser } from './event-parsers/bgs-stage-change-parser';
import { BgsTavernUpgradeParser } from './event-parsers/bgs-tavern-upgrade-parser';
import { BgsTripleCreatedParser } from './event-parsers/bgs-triple-created-parser';
import { BgsTurnStartParser } from './event-parsers/bgs-turn-start-parser';
import { EventParser } from './event-parsers/_event-parser';
import { BgsGameEndEvent } from './events/bgs-game-end-event';
import { BgsHeroSelectedEvent } from './events/bgs-hero-selected-event';
import { BgsHeroSelectionDoneEvent } from './events/bgs-hero-selection-done-event';
import { BgsHeroSelectionEvent } from './events/bgs-hero-selection-event';
import { BgsMatchStartEvent } from './events/bgs-match-start-event';
import { BgsNextOpponentEvent } from './events/bgs-next-opponent-event';
import { BgsOpponentRevealedEvent } from './events/bgs-opponent-revealed-event';
import { BgsPlayerBoardEvent } from './events/bgs-player-board-event';
import { BgsTavernUpgradeEvent } from './events/bgs-tavern-upgrade-event';
import { BgsTripleCreatedEvent } from './events/bgs-triple-created-event';
import { BgsTurnStartEvent } from './events/bgs-turn-start-event';
import { BattlegroundsStoreEvent } from './events/_battlegrounds-store-event';

@Injectable()
export class BattlegroundsStoreService {
	private state: BattlegroundsState = new BattlegroundsState();
	private eventParsers: readonly EventParser[];
	private battlegroundsUpdater: EventEmitter<BattlegroundsStoreEvent> = new EventEmitter<BattlegroundsStoreEvent>();
	private battlegroundsStoreEventBus = new BehaviorSubject<BattlegroundsState>(null);

	private processingQueue = new ProcessingQueue<BattlegroundsStoreEvent>(
		eventQueue => this.processQueue(eventQueue),
		50,
		'battlegrounds-queue',
	);

	constructor(
		private gameEvents: GameEventsEmitterService,
		private allCards: AllCardsService,
		private events: Events,
		private ow: OverwolfService,
	) {
		this.eventParsers = this.buildEventParsers();
		this.registerGameEvents();
		this.battlegroundsUpdater.subscribe((event: GameEvent | BattlegroundsStoreEvent) => {
			// this.logger.debug('[battlegrounds-state] enqueueing', event);
			this.processingQueue.enqueue(event);
		});
		window['battlegroundsStore'] = this.battlegroundsStoreEventBus;
		window['battlegroundsUpdater'] = this.battlegroundsUpdater;
	}

	private registerGameEvents() {
		this.gameEvents.allEvents.subscribe((gameEvent: GameEvent) => {
			if (gameEvent.type === GameEvent.BATTLEGROUNDS_HERO_SELECTION) {
				this.battlegroundsUpdater.next(new BgsHeroSelectionEvent(gameEvent.additionalData.heroCardIds));
			} else if (gameEvent.type === GameEvent.BATTLEGROUNDS_HERO_SELECTED) {
				this.battlegroundsUpdater.next(new BgsHeroSelectedEvent(gameEvent.cardId));
			} else if (
				gameEvent.type === GameEvent.MATCH_METADATA &&
				gameEvent.additionalData.metaData.GameType === GameType.GT_BATTLEGROUNDS
			) {
				this.battlegroundsUpdater.next(new BgsMatchStartEvent());
			} else if (gameEvent.type === GameEvent.MULLIGAN_DONE) {
				this.battlegroundsUpdater.next(new BgsHeroSelectionDoneEvent());
			} else if (gameEvent.type === GameEvent.BATTLEGROUNDS_NEXT_OPPONENT) {
				this.battlegroundsUpdater.next(new BgsNextOpponentEvent(gameEvent.additionalData.nextOpponentCardId));
			} else if (gameEvent.type === GameEvent.BATTLEGROUNDS_OPPONENT_REVEALED) {
				this.battlegroundsUpdater.next(new BgsOpponentRevealedEvent(gameEvent.additionalData.cardId));
			} else if (gameEvent.type === GameEvent.TURN_START) {
				console.log('ready to update turn', this.state);
				// We use this instead of TURN_START so that we only have the combat phase, instead of both turns
				this.battlegroundsUpdater.next(new BgsTurnStartEvent(gameEvent.additionalData.turnNumber));
			} else if (gameEvent.type === GameEvent.BATTLEGROUNDS_TAVERN_UPGRADE) {
				this.battlegroundsUpdater.next(
					new BgsTavernUpgradeEvent(gameEvent.additionalData.cardId, gameEvent.additionalData.tavernLevel),
				);
			} else if (gameEvent.type === GameEvent.BATTLEGROUNDS_PLAYER_BOARD) {
				this.battlegroundsUpdater.next(
					new BgsPlayerBoardEvent(
						gameEvent.additionalData.cardId,
						gameEvent.additionalData.board,
						gameEvent.additionalData.hero,
					),
				);
				// } else if (gameEvent.type === GameEvent.BATTLEGROUNDS_COMBAT_START) {
				// 	this.battlegroundsUpdater.next(new BgsCombatStartEvent());
			} else if (gameEvent.type === GameEvent.BATTLEGROUNDS_TRIPLE) {
				this.battlegroundsUpdater.next(new BgsTripleCreatedEvent(gameEvent.cardId));
				// } else if (gameEvent.type === GameEvent.BATTLEGROUNDS_BOARD_COMPOSITION) {
				// 	this.battlegroundsUpdater.next(new BgsBoardCompositionEvent());
			} else if (gameEvent.type === GameEvent.GAME_END) {
				this.battlegroundsUpdater.next(new BgsGameEndEvent(gameEvent.additionalData.replayXml));
			}
		});
	}

	private async processQueue(eventQueue: readonly BattlegroundsStoreEvent[]) {
		const gameEvent = eventQueue[0];
		try {
			await this.processEvent(gameEvent);
		} catch (e) {
			console.error('Exception while processing event', e);
		}
		return eventQueue.slice(1);
	}

	private async processEvent(gameEvent: BattlegroundsStoreEvent) {
		for (const parser of this.eventParsers) {
			try {
				if (parser.applies(gameEvent, this.state)) {
					this.state = await parser.parse(this.state, gameEvent);
					console.log('updated state', gameEvent.type, this.state, gameEvent);
					this.battlegroundsStoreEventBus.next(this.state);
					this.updateOverlay();
				}
			} catch (e) {
				console.error('[bgs-store] Exception while applying parser', gameEvent.type, e);
			}
		}
	}

	private async updateOverlay() {
		const inGame = this.state && this.state.inGame;

		const battlegroundsWindow = await this.ow.getWindowState(OverwolfService.BATTLEGROUNDS_WINDOW);
		const shouldShowOverlay = true;
		if (inGame && shouldShowOverlay && battlegroundsWindow.window_state_ex === 'closed') {
			await this.ow.obtainDeclaredWindow(OverwolfService.BATTLEGROUNDS_WINDOW);
			await this.ow.restoreWindow(OverwolfService.BATTLEGROUNDS_WINDOW);
		} else if (battlegroundsWindow.window_state_ex !== 'closed' && (!shouldShowOverlay || !inGame)) {
			console.log('[bgs-store] closing overlay', shouldShowOverlay, inGame);
			// await this.ow.closeWindow(OverwolfService.BATTLEGROUNDS_WINDOW);
		}
	}

	private buildEventParsers(): readonly EventParser[] {
		return [
			new BattlegroundsResetBattleStateParser(),
			new BgsInitParser(),
			new BgsHeroSelectionParser(),
			new BgsHeroSelectedParser(),
			new BgsHeroSelectionDoneParser(),
			new BgsNextOpponentParser(),
			new BgsTavernUpgradeParser(),
			new BgsPlayerBoardParser(),
			new BgsTripleCreatedParser(),
			new BgsOpponentRevealedParser(this.allCards),
			new BgsTurnStartParser(),
			new BgsMatchStartParser(),
			new BgsGameEndParser(),
			new BgsStageChangeParser(),
		];
	}
}
