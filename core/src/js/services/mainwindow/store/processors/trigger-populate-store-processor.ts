import { MainWindowState } from '../../../../models/mainwindow/main-window-state';
import { NavigationState } from '../../../../models/mainwindow/navigation/navigation-state';
import { Events } from '../../../events.service';
import { TriggerPopulateStoreEvent } from '../events/trigger-populate-store-event';
import { Processor } from './processor';

export class TriggerPopulateStoreProcessor implements Processor {
	constructor(private readonly events: Events) {}

	public async process(
		event: TriggerPopulateStoreEvent,
		currentState: MainWindowState,
		stateHistory,
		navigationState: NavigationState,
	): Promise<[MainWindowState, NavigationState]> {
		this.events.broadcast(Events.START_POPULATE_COLLECTION_STATE);
		this.events.broadcast(Events.START_POPULATE_ACHIEVEMENT_STATE);
		this.events.broadcast(Events.START_POPULATE_GAME_STATS_STATE);
		this.events.broadcast(Events.START_POPULATE_GLOBAL_STATS_STATE);
		return [null, null];
	}
}
