import { extractTotalManaSpent, parseHsReplayString, Replay } from '@firestone-hs/hs-replay-xml-parser';
import { BlockType } from '@firestone-hs/reference-data';
import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsPanel } from '../../../../models/battlegrounds/bgs-panel';
import { BgsPlayer } from '../../../../models/battlegrounds/bgs-player';
import { BgsInGameStage } from '../../../../models/battlegrounds/in-game/bgs-in-game-stage';
import { BgsNextOpponentOverviewPanel } from '../../../../models/battlegrounds/in-game/bgs-next-opponent-overview-panel';
import { BgsOpponentOverview } from '../../../../models/battlegrounds/in-game/bgs-opponent-overview';
import { BgsPostMatchStats } from '../../../../models/battlegrounds/post-match/bgs-post-match-stats';
import { BgsGameEndEvent } from '../events/bgs-game-end-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { reparseReplay } from './stats/replay-parser';
import { EventParser } from './_event-parser';

export class BgsGameEndParser implements EventParser {
	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BgsGameEndEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsGameEndEvent): Promise<BattlegroundsState> {
		const replay: Replay = parseHsReplayString(event.replayXml);
		const player: BgsPlayer = currentState.currentGame.getMainPlayer();
		const structure = reparseReplay(replay);
		const postMatchStats: BgsPostMatchStats = BgsPostMatchStats.create({
			tavernTimings: player.tavernUpgradeHistory,
			tripleTimings: player.tripleHistory, // TODO: add the cards when relevant
			coinsWasted: this.buildCoinsWasted(currentState, replay),
			rerolls: this.buildRerolls(replay),
			compositionsOverTurn: structure.compositionsOverTurn,
			rerollsOverTurn: structure.rerollsOverTurn,
			hpOverTurn: structure.hpOverTurn,
		} as BgsPostMatchStats);
		console.log('post match stats', postMatchStats);
		return currentState.update({
			stages: stages,
		} as BattlegroundsState);
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

	private buildCoinsWasted(currentState: BattlegroundsState, replay: Replay): number {
		let totalResourcesAvailable = 0;
		for (let i = 0; i < currentState.currentGame.currentTurn; i++) {
			totalResourcesAvailable += Math.min(10, 3 + i);
		}
		const spent = extractTotalManaSpent(replay).player;
		return totalResourcesAvailable - spent;
	}

	private buildInGameStage(cardId: string, currentState: BattlegroundsState): BgsInGameStage {
		const stageToRebuild =
			currentState.stages.find(stage => stage.id === 'in-game') || this.createNewStage(currentState);
		const panelToRebuild = this.createNewPanel(currentState, cardId);

		const panels: readonly BgsPanel[] = stageToRebuild.panels.map(panel =>
			panel.id === 'bgs-next-opponent-overview' ? panelToRebuild : panel,
		);
		return BgsInGameStage.create({
			panels: panels,
		} as BgsInGameStage);
	}

	private createNewStage(currentState: BattlegroundsState): BgsInGameStage {
		return BgsInGameStage.create({
			panels: [BgsNextOpponentOverviewPanel.create({} as BgsNextOpponentOverviewPanel)] as readonly BgsPanel[],
		} as BgsInGameStage);
	}

	private createNewPanel(currentState: BattlegroundsState, cardId: string): BgsNextOpponentOverviewPanel {
		// const nextOpponent = currentState.currentGame.players.find(player => player.cardId === cardId);
		const opponentOverview: BgsOpponentOverview = BgsOpponentOverview.create({
			// Just use the cardId, and let the UI reconstruct from the state to avoid duplicating the info
			cardId: cardId,
			// currentTavernTier:
			// 	nextOpponent.tavernUpgradeHistory.length === 0
			// 		? 1
			// 		: nextOpponent.tavernUpgradeHistory[nextOpponent.tavernUpgradeHistory.length - 1].tavernTier,
			// tavernHistory: nextOpponent.tavernUpgradeHistory,
			// lastKnownBoardState: nextOpponent.boardHistory
			// 	? nextOpponent.boardHistory[nextOpponent.boardHistory.length - 1].board
			// 	: null,
			// tripleHistory: nextOpponent.tripleHistory,
		});
		return BgsNextOpponentOverviewPanel.create({
			opponentOverview: opponentOverview,
		} as BgsNextOpponentOverviewPanel);
	}
}
