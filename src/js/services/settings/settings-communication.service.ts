import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class SettingsCommunicationService {
	private settingsEventBus = new EventEmitter<[string, string]>();

	constructor() {
		window['settingsEventBus'] = this.settingsEventBus;
	}
}