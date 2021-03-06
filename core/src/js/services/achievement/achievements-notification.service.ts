import { Injectable } from '@angular/core';
import { Achievement } from 'src/js/models/achievement';
import { Events } from '../events.service';
import { Message, OwNotificationsService } from '../notifications.service';
import { PreferencesService } from '../preferences.service';
import { Challenge } from './achievements/challenges/challenge';
import { AchievementsLoaderService } from './data/achievements-loader.service';

declare let amplitude;

@Injectable()
export class AchievementsNotificationService {
	constructor(
		private notificationService: OwNotificationsService,
		private prefs: PreferencesService,
		private achievementLoader: AchievementsLoaderService,
		private events: Events,
	) {
		this.events
			.on(Events.ACHIEVEMENT_COMPLETE)
			.subscribe(data => this.handleAchievementCompleted(data.data[0], data.data[1]));
		this.events
			.on(Events.ACHIEVEMENT_RECORDING_STARTED)
			.subscribe(data => this.handleAchievementRecordingStarted(data.data[0], data.data[1]));
		this.events
			.on(Events.ACHIEVEMENT_RECORDED)
			.subscribe(data => this.handleAchievementRecordCompleted(data.data[0]));
		console.log('[achievements-notification] listening for achievement completion events');
	}

	private async handleAchievementCompleted(achievement: Achievement, challenge: Challenge) {
		console.log(
			'[achievements-notification] preparing achievement completed notification',
			achievement.id,
			achievement.numberOfCompletions,
		);
		const prefs = await this.prefs.getPreferences();
		if (achievement.numberOfCompletions > 1 || !prefs.achievementsDisplayNotifications) {
			console.log(
				'[achievements-notification] achievement already completed or pref turned off, not sending any notif',
				achievement.id,
				prefs.achievementsDisplayNotifications,
			);
			return;
		}
		amplitude.getInstance().logEvent('new-achievement', { 'id': achievement.id });
		const notificationTimeout = challenge.notificationTimeout();
		console.log('[achievements-notification] sending new achievement completed notification', achievement.id);
		const recordingOff = (await this.prefs.getPreferences()).dontRecordAchievements;
		const recapText = recordingOff
			? `Achievement saved! Click to recap`
			: `Your replay is being recorded...<span class="loader"></span>`;
		const unclickable = recordingOff ? undefined : 'unclickable';
		this.notificationService.html({
			notificationId: achievement.id,
			content: this.buildNotificationTemplate(achievement, recapText, unclickable),
			type: 'achievement-no-record',
			app: 'achievement',
			cardId: achievement.id,
			timeout: 0, // Used to close the notif if no record notif takes its place
			theClass: 'no-record',
			clickToClose: recordingOff,
		} as Message);
	}

	private async handleAchievementRecordingStarted(achievement: Achievement, challenge: Challenge) {
		console.log('[achievements-notification] in pre-record notification');
		const prefs = await this.prefs.getPreferences();
		if (achievement.numberOfCompletions > 1 || !prefs.achievementsDisplayNotifications) {
			console.log(
				'[achievements-notification] achievement already completed or pref turned off, not sending any notif',
				achievement.id,
				prefs.achievementsDisplayNotifications,
			);
			return;
		}
		console.log('[achievements-notification] sending new notification', achievement.id);
		const recapText = `Your replay is being recorded...<span class="loader"></span>`;
		this.notificationService.html({
			notificationId: achievement.id,
			content: this.buildNotificationTemplate(achievement, recapText, 'unclickable'),
			type: 'achievement-pre-record',
			app: 'achievement',
			cardId: achievement.id,
			timeout: 0, // We will manually remove this notification once the replay is recorded
			theClass: 'pending',
			clickToClose: false,
		});
	}

	private async handleAchievementRecordCompleted(achievement: Achievement) {
		console.log('[achievements-notification] in post-record notification', achievement);
		const prefs = await this.prefs.getPreferences();
		// const achievement: Achievement = await this.achievementLoader.getAchievement(newAchievement.id);
		if (achievement.numberOfCompletions > 1 || !prefs.achievementsDisplayNotifications) {
			console.log(
				'[achievements-notification] achievement already completed or pref turned off, not sending any notif',
				achievement.id,
				prefs.achievementsDisplayNotifications,
			);
			return;
		}
		// In case the pre-record notification has already timed out, we need to send a full notif
		this.notificationService.html({
			notificationId: achievement.id,
			content: this.buildNotificationTemplate(achievement, undefined),
			type: 'achievement-confirm',
			app: 'achievement',
			cardId: achievement.id,
			timeout: 0, // Used in case something goes wrong and this is the first notif that is being shown
			theClass: 'active',
			clickToClose: true,
		});
	}

	private buildNotificationTemplate(
		achievement: Achievement,
		recapText: string,
		unclickable?: 'unclickable',
	): string {
		return `
			<div class="achievement-message-container ${achievement.id} ${unclickable}">
				<div class="achievement-image-container">
					<img
						src="https://static.zerotoheroes.com/hearthstone/cardart/256x/${achievement.displayCardId}.jpg"
						class="real-achievement ${achievement.displayCardType}"/>
					<i class="i-84x90 frame">
						<svg>
							<use xlink:href="/Files/assets/svg/sprite.svg#achievement_frame"/>
						</svg>
					</i>
				</div>
				<div class="message">
					<div class="title">
						<i class="icon-svg">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#${achievement.icon}"/>
							</svg>
						</i>
						<span>Achievement unlocked!</span>
					</div>
					<span class="text">${achievement.displayName}</span>
					<div class="recap-text">
						<span class="pending">${recapText}</span>
						<span class="active">Replay saved! Click to recap</span>
						<span class="no-record">${recapText}</span>
					</div>
				</div>
				<button class="i-30 close-button">
					<svg class="svg-icon-fill">
						<use xmlns:xlink="https://www.w3.org/1999/xlink" xlink:href="/Files/assets/svg/sprite.svg#window-control_close"></use>
					</svg>
				</button>
			</div>`;
	}
}
