import { BgsStage } from './bgs-stage';
import { BgsStageId } from './bgs-stage-id.type';
import { BgsStats } from './stats/bgs-stats';

export class BattlegroundsState {
	readonly stages: readonly BgsStage[];
	readonly currentStageId: BgsStageId;
	readonly globalStats: BgsStats;

	public static create(base: BattlegroundsState): BattlegroundsState {
		return Object.assign(new BattlegroundsState(), base);
	}
}
