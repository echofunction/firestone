import { MainWindowStoreEvent } from './main-window-store-event';

export class TriggerPopulateStoreEvent implements MainWindowStoreEvent {
	public static eventName(): string {
		return 'TriggerPopulateStoreEvent';
	}

	public eventName(): string {
		return 'TriggerPopulateStoreEvent';
	}

	public isNavigationEvent(): boolean {
		return false;
	}

	public isResetHistoryEvent(): boolean {
		return false;
	}
}
