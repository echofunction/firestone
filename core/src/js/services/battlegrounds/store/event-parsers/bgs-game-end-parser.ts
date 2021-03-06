import { BgsBestStat } from '@firestone-hs/compute-bgs-run-stats/dist/model/bgs-best-stat';
import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsPanel } from '../../../../models/battlegrounds/bgs-panel';
import { BgsPlayer } from '../../../../models/battlegrounds/bgs-player';
import { BgsStage } from '../../../../models/battlegrounds/bgs-stage';
import { BgsInGameStage } from '../../../../models/battlegrounds/in-game/bgs-in-game-stage';
import { BgsPostMatchStage } from '../../../../models/battlegrounds/post-match/bgs-post-match-stage';
import { BgsPostMatchStats } from '../../../../models/battlegrounds/post-match/bgs-post-match-stats';
import { BgsPostMatchStatsPanel } from '../../../../models/battlegrounds/post-match/bgs-post-match-stats-panel';
import { Preferences } from '../../../../models/preferences';
import { PreferencesService } from '../../../preferences.service';
import { BgsGameEndEvent } from '../events/bgs-game-end-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { EventParser } from './_event-parser';

// TODO: coins wasted doesn't take into account hero powers that let you have more coins (Bel'ial)
export class BgsGameEndParser implements EventParser {
	constructor(private readonly prefs: PreferencesService) {}

	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && state.currentGame && gameEvent.type === 'BgsGameEndEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsGameEndEvent): Promise<BattlegroundsState> {
		const prefs: Preferences = await this.prefs.getPreferences();
		console.warn('will build post-match info', prefs.bgsForceShowPostMatchStats);
		const newBestUserStats: readonly BgsBestStat[] = event.newBestStats;
		const newPostMatchStatsStage: BgsPostMatchStage = this.buildPostMatchStage(
			event.postMatchStats,
			newBestUserStats,
			currentState,
		);
		const stages: readonly BgsStage[] = currentState.stages.map(stage =>
			stage.id === newPostMatchStatsStage.id ? newPostMatchStatsStage : stage,
		);
		return currentState.update({
			stages: stages,
			currentStageId: 'post-match',
			currentPanelId: 'bgs-post-match-stats',
			forceOpen: prefs.bgsForceShowPostMatchStats ? true : false,
		} as BattlegroundsState);
	}

	private buildPostMatchStage(
		postMatchStats: BgsPostMatchStats,
		newBestUserStats: readonly BgsBestStat[],
		currentState: BattlegroundsState,
	): BgsPostMatchStage {
		const stageToRebuild =
			currentState.stages.find(stage => stage.id === 'post-match') || this.createNewStage(currentState);
		const panelToRebuild = this.createNewPanel(currentState, postMatchStats, newBestUserStats);

		const panels: readonly BgsPanel[] = stageToRebuild.panels.map(panel =>
			panel.id === 'bgs-post-match-stats' ? panelToRebuild : panel,
		);
		return BgsPostMatchStage.create({
			panels: panels,
		} as BgsPostMatchStage);
	}

	private createNewStage(currentState: BattlegroundsState): BgsInGameStage {
		return BgsPostMatchStage.create({
			panels: [BgsPostMatchStatsPanel.create({} as BgsPostMatchStatsPanel)] as readonly BgsPanel[],
		} as BgsPostMatchStage);
	}

	private createNewPanel(
		currentState: BattlegroundsState,
		postMatchStats: BgsPostMatchStats,
		newBestUserStats: readonly BgsBestStat[],
	): BgsPostMatchStatsPanel {
		const player: BgsPlayer = currentState.currentGame.getMainPlayer();
		const finalPosition = player.leaderboardPlace;
		console.log('post match stats');
		return BgsPostMatchStatsPanel.create({
			stats: postMatchStats,
			newBestUserStats: newBestUserStats,
			globalStats: currentState.globalStats,
			player: currentState.currentGame.getMainPlayer(),
			selectedStat: 'hp-by-turn',
			tabs: ['hp-by-turn', 'warband-total-stats-by-turn', 'warband-composition-by-turn'],
			isComputing: false,
			name: 'You finished #' + finalPosition,
		} as BgsPostMatchStatsPanel);
	}
}
