import { BgsGame } from './bgs-game';
import { BgsPanelId } from './bgs-panel-id.type';
import { BgsStage } from './bgs-stage';
import { BgsStageId } from './bgs-stage-id.type';
import { BgsPostMatchStats } from './post-match/bgs-post-match-stats';
import { BgsStats } from './stats/bgs-stats';

export class BattlegroundsState {
	readonly stages: readonly BgsStage[];
	readonly currentStageId: BgsStageId;
	readonly currentPanelId: BgsPanelId;
	readonly globalStats: BgsStats;
	readonly currentGame: BgsGame;
	readonly inGame: boolean;
	readonly postMatchStats: BgsPostMatchStats;

	public static create(base: BattlegroundsState): BattlegroundsState {
		return Object.assign(new BattlegroundsState(), base);
	}

	public update(base: BattlegroundsState): BattlegroundsState {
		return Object.assign(new BattlegroundsState(), this, base);
	}
}
