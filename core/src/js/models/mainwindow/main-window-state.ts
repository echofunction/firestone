import { CurrentUser } from '../overwolf/profile/current-user';
import { AchievementsState } from './achievements-state';
import { BinderState } from './binder-state';
import { CurrentAppType } from './current-app.type';
import { DecktrackerState } from './decktracker/decktracker-state';
import { Navigation } from './navigation';
import { ReplaysState } from './replays/replays-state';
import { SocialShareUserInfo } from './social-share-user-info';
import { GlobalStats } from './stats/global/global-stats';
import { StatsState } from './stats/stats-state';

export class MainWindowState {
	readonly isVisible: boolean = false;
	readonly currentUser: CurrentUser = null;
	readonly currentApp: CurrentAppType = 'achievements';
	readonly replays: ReplaysState = new ReplaysState();
	readonly binder: BinderState = new BinderState();
	readonly achievements: AchievementsState = new AchievementsState();
	readonly decktracker: DecktrackerState = new DecktrackerState();
	readonly socialShareUserInfo: SocialShareUserInfo = new SocialShareUserInfo();
	readonly stats: StatsState = new StatsState();
	readonly globalStats: GlobalStats = new GlobalStats();
	readonly navigation: Navigation = new Navigation();
}