import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BgsPanel } from '../../../../models/battlegrounds/bgs-panel';
import { BgsStage } from '../../../../models/battlegrounds/bgs-stage';
import { BgsHeroOverview } from '../../../../models/battlegrounds/hero-selection/bgs-hero-overview';
import { BgsHeroSelectionOverview } from '../../../../models/battlegrounds/hero-selection/bgs-hero-selection-overview';
import { BgsHeroSelectionStage } from '../../../../models/battlegrounds/hero-selection/bgs-hero-selection-stage';
import { BgsInitEvent } from '../events/bgs-init-event';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { EventParser } from './_event-parser';

export class BgsInitParser implements EventParser {
	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BgsInitEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsInitEvent): Promise<BattlegroundsState> {
		const stages: readonly BgsStage[] = [this.buildHeroSelectionStage()];
		return BattlegroundsState.create({
			globalStats: event.bgsGlobalStats,
			stages: stages,
			currentStageId: undefined,
		});
	}

	private buildHeroSelectionStage(): BgsHeroSelectionStage {
		const panels: readonly BgsPanel[] = [this.buildBgsHeroSelectionOverview()];
		return BgsHeroSelectionStage.create({
			panels: panels,
		} as BgsHeroSelectionStage);
	}

	private buildBgsHeroSelectionOverview(): BgsHeroSelectionOverview {
		const heroOverview: readonly BgsHeroOverview[] = [];
		return BgsHeroSelectionOverview.create({
			heroOverview: heroOverview,
		} as BgsHeroSelectionOverview);
	}
}
