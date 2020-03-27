import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface BroadcastEvent {
	key: any;
	data: any[];
}

export class Events {
	public static readonly NO_LOG_FILE = 'no-log-file';
	public static readonly START_LOG_FILE_DETECTION = 'start-log-file-detection';
	public static readonly STREAMING_LOG_FILE = 'streaming-log-file';

	public static readonly NEW_PACK = 'new-pack';
	public static readonly NEW_CARD = 'new-card';
	public static readonly MORE_DUST = 'more-dust';

	// When achievement has been completed, and before all similar achievements have been filtered out
	public static readonly ACHIEVEMENT_UNLOCKED = 'achievement-unlocked';
	// When similar achievements have been filtered out to only keep the more relevant one
	public static readonly ACHIEVEMENT_COMPLETE = 'achievement-complete';
	public static readonly ACHIEVEMENT_RECORDED = 'achievement-recorded';
	public static readonly ACHIEVEMENT_RECORDING_STARTED = 'achievement-recording-started';
	// public static readonly ACHIEVEMENT_RECORD_END = 'achievement-record-end';

	public static readonly NEW_GAME_ID = 'new-game-id';
	public static readonly REVIEW_FINALIZED = 'review-finalized';
	public static readonly GAME_END = 'events-game-end';
	public static readonly REVIEW_INITIALIZED = 'review-initialized';
	public static readonly SCENE_CHANGED = 'scene-changed';
	public static readonly PLAYER_INFO = 'player-info';
	public static readonly OPPONENT_INFO = 'opponent-info';

	public static readonly START_BGS_BATTLE_SIMULATION = 'EVENTS_START_BGS_BATTLE_SIMULATION';

	public static readonly GAME_STATS_UPDATED = 'events-game-stats-updated';
	public static readonly GLOBAL_STATS_UPDATED = 'global-stats-updated';
	public static readonly MATCH_STATS_UPDATED = 'EVENTS_MATCH_STATS_UPDATED';

	public static readonly SHOW_TOOLTIP = 'show-tooltip';
	public static readonly HIDE_TOOLTIP = 'hide-tooltip';

	// An intermediate layer for decktracker, so that we have better control on the display
	public static readonly DECK_SHOW_TOOLTIP = 'deck-show-tooltip';
	public static readonly DECK_HIDE_TOOLTIP = 'deck-hide-tooltip';

	public static readonly SETTINGS_DISPLAY_MODAL = 'settings-display-modal';

	public static readonly FORMAT_SELECTED = 'format-selected'; // For FTUE, will be refactored later
	public static readonly SET_SELECTED = 'set-selected'; // For FTUE, will be refactored later
	public static readonly SET_MOUSE_OVER = 'set-mouse-over'; // For FTUE, will be refactored later

	public static readonly SHOW_MODAL = 'show-modal';
	public static readonly HIDE_MODAL = 'hide-modal';

	public static readonly START_POPULATE_COLLECTION_STATE = 'start-populate-collection-state';
	public static readonly START_POPULATE_ACHIEVEMENT_STATE = 'start-populate-achievements-state';
	public static readonly START_POPULATE_GAME_STATS_STATE = 'start-populate-game-stats-state';
	public static readonly START_POPULATE_GLOBAL_STATS_STATE = 'start-populate-global-stats-state';

	private _eventBus: Subject<BroadcastEvent>;

	constructor() {
		this._eventBus = new Subject<BroadcastEvent>();
	}

	broadcast(key: any, ...data: any[]) {
		// console.debug('broadcasting', key);
		this._eventBus.next({ key, data });
	}

	on(key: any): Observable<BroadcastEvent> {
		// console.debug('subscribing', key);
		return this._eventBus.asObservable().pipe(
			filter(event => event.key === key),
			map(event => event),
		);
	}
}
