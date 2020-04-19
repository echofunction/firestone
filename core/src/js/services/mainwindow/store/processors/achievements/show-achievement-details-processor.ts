import { MainWindowState } from '../../../../../models/mainwindow/main-window-state';
import { NavigationAchievements } from '../../../../../models/mainwindow/navigation/navigation-achievements';
import { NavigationState } from '../../../../../models/mainwindow/navigation/navigation-state';
import { ShowAchievementDetailsEvent } from '../../events/achievements/show-achievement-details-event';
import { Processor } from '../processor';

export class ShowAchievementDetailsProcessor implements Processor {
	public async process(
		event: ShowAchievementDetailsEvent,
		currentState: MainWindowState,
		history,
		navigationState: NavigationState,
	): Promise<[MainWindowState, NavigationState]> {
		// console.log('[show-achievement-details] input', event, currentState);
		const [globalCategory, achievementSet, visualAchievement] = currentState.achievements.findAchievementHierarchy(
			event.achievementId,
		);
		// console.log('[show-achievement-details] showing achievement', event, achievementSet, visualAchievement);
		const achievement = visualAchievement.completionSteps[0].id;
		// console.log('[show-achievement-details] achievement', achievement, currentState);
		const newAchievements = navigationState.navigationAchievements.update({
			currentView: 'list',
			menuDisplayType: 'breadcrumbs',
			selectedGlobalCategoryId: globalCategory.id,
			selectedCategoryId: achievementSet.id,
			achievementsList: achievementSet.achievements.map(ach => ach.id) as readonly string[],
			displayedAchievementsList: achievementSet.achievements.map(ach => ach.id) as readonly string[],
			selectedAchievementId: achievement,
		} as NavigationAchievements);
		return [
			null,
			navigationState.update({
				isVisible: true,
				currentApp: 'achievements',
				navigationAchievements: newAchievements,
				text:
					globalCategory.name !== achievementSet.displayName
						? globalCategory.name + ' ' + achievementSet.displayName
						: achievementSet.displayName,
				image: null,
			} as NavigationState),
		];
	}
}
