import { AchievementSet } from '../../../../../models/achievement-set';
import { AchievementsState } from '../../../../../models/mainwindow/achievements-state';
import { MainWindowState } from '../../../../../models/mainwindow/main-window-state';
import { SelectAchievementSetEvent } from '../../events/achievements/select-achievement-set-event';
import { Processor } from '../processor';

export class SelectAchievementSetProcessor implements Processor {
	public async process(event: SelectAchievementSetEvent, currentState: MainWindowState): Promise<MainWindowState> {
		const globalCategory = currentState.achievements.globalCategories.find(cat =>
			cat.achievementSets.some(set => set.id === event.achievementSetId),
		);
		const achievementSet: AchievementSet = globalCategory.achievementSets.find(
			set => set.id === event.achievementSetId,
		);
		const newState = Object.assign(new AchievementsState(), currentState.achievements, {
			currentView: 'list',
			menuDisplayType: 'breadcrumbs',
			selectedGlobalCategory: globalCategory,
			selectedCategory: achievementSet,
			achievementCategories: globalCategory.achievementSets as readonly AchievementSet[],
			achievementsList: achievementSet.achievements,
			displayedAchievementsList: achievementSet.achievements,
			selectedAchievementId: undefined,
		} as AchievementsState);
		return Object.assign(new MainWindowState(), currentState, {
			achievements: newState,
			isVisible: true,
		} as MainWindowState);
	}
}