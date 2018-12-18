import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Preferences } from '../../models/preferences';
import { PreferencesService } from '../../services/preferences.service';

@Component({
	selector: 'settings-achievements-capture',
	styleUrls: [
		`../../../css/global/components-global.scss`,
		`../../../css/global/scrollbar-settings.scss`,
		`../../../css/component/settings/settings-common.component.scss`,
		`../../../css/component/settings/settings-achievements-capture.component.scss`
	],
	template: `
		<div class="achievements-capture" [ngClass]="{'disabled': !captureVideo}">
			<input type="checkbox" name="video-capture" id="video-capture-checkbox">
			<label class="record-video" for="video-capture-checkbox" (click)="toggleVideoCapture($event)">
				<i class="unselected" *ngIf="!captureVideo">
					<svg>
						<use xlink:href="/Files/assets/svg/sprite.svg#unchecked_box"/>
					</svg>
				</i>
				<i class="checked" *ngIf="captureVideo">
					<svg>
						<use xlink:href="/Files/assets/svg/sprite.svg#checked_box"/>
					</svg>
				</i>
				<p>
					Record achievements
					<i class="info">
						<svg>
							<use xlink:href="/Files/assets/svg/sprite.svg#info"/>
						</svg>
						<div class="zth-tooltip right">
							<p>Disabling it prevents automated video recording. Uncheck if the game's performances are affected.</p>
							<svg class="tooltip-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9">
								<polygon points="0,0 8,-9 16,0"/>
							</svg>
						</div>
					</i>
				</p>
			</label>
			<settings-achievements-video-capture></settings-achievements-video-capture>
			<settings-achievements-sound-capture></settings-achievements-sound-capture>
			<settings-achievements-storage></settings-achievements-storage>
        </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAchievementsCaptureComponent {

	captureVideo: boolean = true;

	constructor(private prefs: PreferencesService, private cdr: ChangeDetectorRef) {
		this.updateDefaultValues();
	}

	toggleVideoCapture(event) {
		this.captureVideo = !this.captureVideo;
		this.changeVideoSettings();
		this.cdr.detectChanges();
	}

	private async updateDefaultValues() {
		this.captureVideo = !(await this.prefs.getPreferences()).dontRecordAchievements;
	}

	private async changeVideoSettings() {
		console.log('changing settings with', this.captureVideo);
		const result = await this.prefs.setDontRecordAchievements(!this.captureVideo);
		console.log('recording settings changed', result);
	}
}
