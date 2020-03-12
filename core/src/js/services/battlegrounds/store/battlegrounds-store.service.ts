import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BattlegroundsState } from '../../../models/battlegrounds/battlegrounds-state';
import { GameEvent } from '../../../models/game-event';
import { Events } from '../../events.service';
import { GameEventsEmitterService } from '../../game-events-emitter.service';
import { ProcessingQueue } from '../../processing-queue.service';
import { BattlegroundsResetBattleStateParser } from './event-parsers/battlegrounds-reset-battle-state-parser';
import { BgsInitParser } from './event-parsers/bgs-init-parser';
import { EventParser } from './event-parsers/_event-parser';
import { BattlegroundsStoreEvent } from './events/_battlegrounds-store-event';

@Injectable()
export class BattlegroundsStoreService {
	private state: BattlegroundsState = new BattlegroundsState();
	private eventParsers: readonly EventParser[];
	private battlegroundsUpdater: EventEmitter<BattlegroundsStoreEvent> = new EventEmitter<BattlegroundsStoreEvent>();
	private BattlegroundsStoreEventBus = new BehaviorSubject<BattlegroundsState>(null);

	private processingQueue = new ProcessingQueue<BattlegroundsStoreEvent>(
		eventQueue => this.processQueue(eventQueue),
		50,
		'battlegrounds-queue',
	);

	constructor(private gameEvents: GameEventsEmitterService, private events: Events) {
		this.eventParsers = this.buildEventParsers();
		this.registerGameEvents();
		this.battlegroundsUpdater.subscribe((event: GameEvent | BattlegroundsStoreEvent) => {
			// this.logger.debug('[battlegrounds-state] enqueueing', event);
			this.processingQueue.enqueue(event);
		});
		this.eventParsers = this.buildEventParsers();
		this.registerGameEvents();
		window['BattlegroundsStoreEventBus'] = this.BattlegroundsStoreEventBus;
		window['battlegroundsUpdater'] = this.battlegroundsUpdater;
	}

	private registerGameEvents() {
		// this.gameEvents.allEvents.subscribe((gameEvent: GameEvent) => {
		// 	this.processingQueue.enqueue(gameEvent);
		// });
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
					this.BattlegroundsStoreEventBus.next(this.state);
				}
			} catch (e) {
				console.error('[bgs-store] Exception while applying parser', gameEvent.type, e);
			}
		}
	}

	private buildEventParsers(): readonly EventParser[] {
		return [new BattlegroundsResetBattleStateParser(), new BgsInitParser()];
	}
}
