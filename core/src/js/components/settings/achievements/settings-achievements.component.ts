import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'settings-achievements',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/settings/achievements/settings-achievements.component.scss`,
	],
	template: `
		<ul class="achievements">
			<settings-achievements-menu [selectedMenu]="_selectedMenu" (onMenuSelected)="onMenuSelected($event)">
			</settings-achievements-menu>
			<ng-container [ngSwitch]="_selectedMenu">
				<settings-achievements-capture *ngSwitchCase="'capture'"></settings-achievements-capture>
				<settings-achievements-notifications
					*ngSwitchCase="'notifications'"
				></settings-achievements-notifications>
			</ng-container>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAchievementsComponent {
	_selectedMenu: string;
	@Input() set selectedMenu(value: string) {
		this._selectedMenu = value || 'notifications';
	}

	onMenuSelected(selectedMenuItem) {
		this.selectedMenu = selectedMenuItem;
	}
}
