import { EventEmitter, Injectable } from '@angular/core';
import { GameType } from '@firestone-hs/reference-data';
import { BehaviorSubject } from 'rxjs';
import { BattlegroundsState } from '../../../models/battlegrounds/battlegrounds-state';
import { GameEvent } from '../../../models/game-event';
import { Events } from '../../events.service';
import { GameEventsEmitterService } from '../../game-events-emitter.service';
import { OverwolfService } from '../../overwolf.service';
import { ProcessingQueue } from '../../processing-queue.service';
import { BattlegroundsResetBattleStateParser } from './event-parsers/battlegrounds-reset-battle-state-parser';
import { BgsHeroSelectionParser } from './event-parsers/bgs-hero-selection-parser';
import { BgsInitParser } from './event-parsers/bgs-init-parser';
import { EventParser } from './event-parsers/_event-parser';
import { BgsHeroSelectionEvent } from './events/bgs-hero-selection-event';
import { BgsMatchStartEvent } from './events/bgs-match-start-event';
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

	constructor(private gameEvents: GameEventsEmitterService, private events: Events, private ow: OverwolfService) {
		this.eventParsers = this.buildEventParsers();
		this.registerGameEvents();
		this.battlegroundsUpdater.subscribe((event: GameEvent | BattlegroundsStoreEvent) => {
			// this.logger.debug('[battlegrounds-state] enqueueing', event);
			this.processingQueue.enqueue(event);
		});
		this.eventParsers = this.buildEventParsers();
		this.registerGameEvents();
		window['battlegroundsStore'] = this.battlegroundsStoreEventBus;
		window['battlegroundsUpdater'] = this.battlegroundsUpdater;
	}

	private registerGameEvents() {
		this.gameEvents.allEvents.subscribe((gameEvent: GameEvent) => {
			if (gameEvent.type === GameEvent.BATTLEGROUNDS_HERO_SELECTION) {
				this.battlegroundsUpdater.next(new BgsHeroSelectionEvent(gameEvent.additionalData.heroCardIds));
			} else if (
				gameEvent.type === GameEvent.MATCH_METADATA &&
				gameEvent.additionalData.metaData.GameType === GameType.GT_BATTLEGROUNDS
			) {
				this.battlegroundsUpdater.next(new BgsMatchStartEvent());
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
					console.log('updated state', this.state, gameEvent.type);
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
			await this.ow.closeWindow(OverwolfService.BATTLEGROUNDS_WINDOW);
		}
	}

	private buildEventParsers(): readonly EventParser[] {
		return [
			// new BgsMatchStartParser(),
			new BattlegroundsResetBattleStateParser(),
			new BgsInitParser(),
			new BgsHeroSelectionParser(),
		];
	}
}
