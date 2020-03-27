import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsPanel } from '../../../../models/battlegrounds/bgs-panel';
import { BgsStage } from '../../../../models/battlegrounds/bgs-stage';
import { BgsInGameStage } from '../../../../models/battlegrounds/in-game/bgs-in-game-stage';
import { BgsNextOpponentOverviewPanel } from '../../../../models/battlegrounds/in-game/bgs-next-opponent-overview-panel';
import { BgsOpponentOverview } from '../../../../models/battlegrounds/in-game/bgs-opponent-overview';
import { BgsNextOpponentEvent } from '../events/bgs-next-opponent-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { EventParser } from './_event-parser';

export class BgsNextOpponentParser implements EventParser {
	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && state.currentGame && gameEvent.type === 'BgsNextOpponentEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsNextOpponentEvent): Promise<BattlegroundsState> {
		const newNextOpponentStage: BgsInGameStage = this.buildInGameStage(event.cardId, currentState);
		const stages: readonly BgsStage[] = currentState.stages.map(stage =>
			stage.id === newNextOpponentStage.id ? newNextOpponentStage : stage,
		);
		return currentState.update({
			stages: stages,
			currentStageId: 'in-game',
			currentPanelId: 'bgs-next-opponent-overview',
		} as BattlegroundsState);
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
