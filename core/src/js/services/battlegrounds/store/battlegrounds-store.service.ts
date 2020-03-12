import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BattlegroundsState } from '../../../models/battlegrounds/battlegrounds-state';
import { GameEvent } from '../../../models/game-event';
import { Events } from '../../events.service';
import { GameEventsEmitterService } from '../../game-events-emitter.service';
import { ProcessingQueue } from '../../processing-queue.service';
import { EventParser } from './event-parser/_event-parser';
import { BattlegroundsResetBattleStateParser } from './event-parsers/battlegrounds-reset-battle-state-parser';
import { BattlegroundsEvent } from './events/_battlegrounds-event';

@Injectable()
export class GameStateService {
	private state: BattlegroundsState = new BattlegroundsState();
	private eventParsers: readonly EventParser[];
	private battlegroundsUpdater: EventEmitter<BattlegroundsEvent> = new EventEmitter<BattlegroundsEvent>();
	private battlegroundsEventBus = new BehaviorSubject<BattlegroundsState>(null);

	private processingQueue = new ProcessingQueue<BattlegroundsEvent>(
		eventQueue => this.processQueue(eventQueue),
		50,
		'battlegrounds-queue',
	);

	constructor(private gameEvents: GameEventsEmitterService, private events: Events) {
		this.eventParsers = this.buildEventParsers();
		this.registerGameEvents();
		this.battlegroundsUpdater.subscribe((event: GameEvent | BattlegroundsEvent) => {
			// this.logger.debug('[battlegrounds-state] enqueueing', event);
			this.processingQueue.enqueue(event);
		});
		this.eventParsers = this.buildEventParsers();
		this.registerGameEvents();
		window['battlegroundsEventBus'] = this.battlegroundsEventBus;
		window['battlegroundsUpdater'] = this.battlegroundsUpdater;
	}

	private registerGameEvents() {
		// this.gameEvents.allEvents.subscribe((gameEvent: GameEvent) => {
		// 	this.processingQueue.enqueue(gameEvent);
		// });
	}

	private async processQueue(eventQueue: readonly BattlegroundsEvent[]) {
		const gameEvent = eventQueue[0];
		try {
			await this.processEvent(gameEvent);
		} catch (e) {
			console.error('Exception while processing event', e);
		}
		return eventQueue.slice(1);
	}

	private async processEvent(gameEvent: BattlegroundsEvent) {
		for (const parser of this.eventParsers) {
			try {
				if (parser.applies(gameEvent, this.state)) {
					this.state = await parser.parse(this.state, gameEvent);
					this.battlegroundsEventBus.next(this.state);
				}
			} catch (e) {
				console.error('[bgs-store] Exception while applying parser', parser.event(), e);
			}
		}
	}

	private buildEventParsers(): readonly EventParser[] {
		return [new BattlegroundsResetBattleStateParser()];
	}
}
