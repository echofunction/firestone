import { Injectable } from '@angular/core';
import { Achievement } from '../../models/achievement';
import { PreferencesService } from '../preferences.service';
import { AchievementsLoaderService } from './data/achievements-loader.service';

@Injectable()
export class AchievementRecordingService {
	constructor(private loader: AchievementsLoaderService, private prefs: PreferencesService) {}

	public async shouldRecord(achievement: Achievement): Promise<boolean> {
		// If the user asked to not record, don't record
		const recordingOff = (await this.prefs.getPreferences()).dontRecordAchievements;
		if (recordingOff) {
			console.log('[achievements-recording] recording is turned off, not recording achievement', achievement.id);
			return false;
		}
		// If it's not the highest step of any achievement, don't record it
		const allAchievements = await this.loader.getAchievements();
		const priorityAchievements = allAchievements
			.filter(achv => achv.type === achievement.type)
			.filter(achv => achv.priority > achievement.priority)
			.filter(achv => achv.numberOfCompletions > 0);
		if (priorityAchievements && priorityAchievements.length > 0) {
			console.log(
				'[achievements-recording] Another more interesting achievement was already recorded, skipping',
				achievement.id,
				priorityAchievements.map(achv => achv.id),
			);
			return false;
		}

		// If it is, don't record it more than the max number of allowed records
		if (achievement && achievement.replayInfo && achievement.replayInfo.length >= achievement.maxNumberOfRecords) {
			console.log(
				'[achievements-recording] Already recorded the max number of achievements',
				achievement.replayInfo,
			);
			return false;
		}
		console.log('[achievements-recording] Will record', achievement.id);
		return true;
	}
}
