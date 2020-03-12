import { BgsStage } from './bgs-stage';
import { BgsStageId } from './bgs-stage-id.type';
import { BgsGlobalStats } from './stats/bgs-global-stats';

export class BattlegroundsState {
	stages: readonly BgsStage[];
	currentStageId: BgsStageId;
	globalStats: BgsGlobalStats;
}
