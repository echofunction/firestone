import { extractTotalManaSpent, parseHsReplayString, Replay } from '@firestone-hs/hs-replay-xml-parser';
import { BlockType } from '@firestone-hs/reference-data';
import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsPanel } from '../../../../models/battlegrounds/bgs-panel';
import { BgsPlayer } from '../../../../models/battlegrounds/bgs-player';
import { BgsStage } from '../../../../models/battlegrounds/bgs-stage';
import { BgsInGameStage } from '../../../../models/battlegrounds/in-game/bgs-in-game-stage';
import { BgsPostMatchStage } from '../../../../models/battlegrounds/post-match/bgs-post-match-stage';
import { BgsPostMatchStats } from '../../../../models/battlegrounds/post-match/bgs-post-match-stats';
import { BgsPostMatchStatsPanel } from '../../../../models/battlegrounds/post-match/bgs-post-match-stats-panel';
import { NumericTurnInfo } from '../../../../models/battlegrounds/post-match/numeric-turn-info';
import { BgsGameEndEvent } from '../events/bgs-game-end-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { reparseReplay } from './stats/replay-parser';
import { EventParser } from './_event-parser';

// TODO: coins wasted doesn't take into account hero powers that let you have more coins (Bel'ial)
export class BgsGameEndParser implements EventParser {
	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BgsGameEndEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsGameEndEvent): Promise<BattlegroundsState> {
		const newPostMatchStatsStage: BgsPostMatchStage = this.buildPostMatchStage(event.replayXml, currentState);
		const stages: readonly BgsStage[] = currentState.stages.map(stage =>
			stage.id === newPostMatchStatsStage.id ? newPostMatchStatsStage : stage,
		);
		return currentState.update({
			stages: stages,
			currentStageId: 'post-match',
			currentPanelId: 'bgs-post-match-stats',
		} as BattlegroundsState);
	}

	private buildPostMatchStage(replayXml: string, currentState: BattlegroundsState): BgsPostMatchStage {
		const stageToRebuild =
			currentState.stages.find(stage => stage.id === 'post-match') || this.createNewStage(currentState);
		const panelToRebuild = this.createNewPanel(currentState, replayXml);

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

	private createNewPanel(currentState: BattlegroundsState, replayXml: string): BgsPostMatchStatsPanel {
		const replay: Replay = parseHsReplayString(replayXml);
		const player: BgsPlayer = currentState.currentGame.getMainPlayer();
		const structure = reparseReplay(replay);
		const postMatchStats: BgsPostMatchStats = BgsPostMatchStats.create({
			tavernTimings: player.tavernUpgradeHistory,
			tripleTimings: player.tripleHistory, // TODO: add the cards when relevant
			coinsWasted: this.buildCoinsWasted(currentState, replay, structure.minionsSoldOverTurn),
			rerolls: this.buildRerolls(replay),
			compositionsOverTurn: structure.compositionsOverTurn,
			rerollsOverTurn: structure.rerollsOverTurn,
			hpOverTurn: structure.hpOverTurn,
			totalStatsOverTurn: structure.totalStatsOverTurn,
			minionsSoldOverTurn: structure.minionsSoldOverTurn,
		} as BgsPostMatchStats);
		console.log('post match stats', postMatchStats);
		return BgsPostMatchStatsPanel.create({
			stats: postMatchStats,
		} as BgsPostMatchStatsPanel);
	}

	private buildRerolls(replay: Replay): number {
		const rerollButtonEntityIds = replay.replay
			.findall(`.//FullEntity[@cardID='TB_BaconShop_8p_Reroll_Button']`)
			.map(entity => entity.get('id'));
		const numberOfTimesRerolled = replay.replay
			.findall(`.//Block[@type='${BlockType.POWER}']`)
			.filter(action => rerollButtonEntityIds.indexOf(action.get('entity')) !== -1).length;
		return numberOfTimesRerolled;
	}

	private buildCoinsWasted(
		currentState: BattlegroundsState,
		replay: Replay,
		minionsSoldOverTurn: readonly NumericTurnInfo[],
	): number {
		let totalResourcesAvailable = 0;
		for (let i = 0; i < currentState.currentGame.currentTurn; i++) {
			totalResourcesAvailable += Math.min(10, 3 + i);
		}
		// TODO: this doesn't take into account the sold
		const spent = extractTotalManaSpent(replay).player;
		const earnedWithMinions = minionsSoldOverTurn.map(sold => sold.value).reduce((a, b) => a + b, 0);
		console.log('earned', earnedWithMinions, 'by selling minions');
		return totalResourcesAvailable + earnedWithMinions - spent;
	}
}
