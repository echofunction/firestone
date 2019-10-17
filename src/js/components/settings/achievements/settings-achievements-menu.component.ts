import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'settings-achievements-menu',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/settings/achievements/settings-achievements-menu.component.scss`,
	],
	template: `
		<ul class="achievements-menu">
			<li [ngClass]="{ 'selected': selectedMenu === 'capture' }" (mousedown)="selectMenu('capture')">
				<span>Video options</span>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAchievementsMenuComponent {
	@Output() onMenuSelected = new EventEmitter<string>();
	@Input() selectedMenu: string;

	selectMenu(menu: string) {
		this.onMenuSelected.next(menu);
	}
}