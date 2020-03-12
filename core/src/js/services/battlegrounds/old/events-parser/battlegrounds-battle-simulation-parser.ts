import { BattlegroundsState } from '../../../../models/battlegrounds/old/battlegrounds-state';
import { EventParser } from '../../store/event-parser/_event-parser';
import { BattlegroundsBattleSimulationEvent } from '../../store/events/battlegrounds-battle-simulation-event';
import { BattlegroundsEvent } from '../../store/events/_battlegrounds-event';

export class BattlegroundsBattleSimulationParser implements EventParser {
	public applies(gameEvent: BattlegroundsEvent, state: BattlegroundsState): boolean {
		return state && gameEvent.type === 'BattlegroundsBattleSimulationEvent';
	}

	public async parse(
		currentState: BattlegroundsState,
		event: BattlegroundsBattleSimulationEvent,
	): Promise<BattlegroundsState> {
		return currentState.update({ battleResult: event.result } as BattlegroundsState);
	}

	public event() {
		return 'BATTLEGROUNDS_BATTLE_SIMULATION_RESULT';
	}
}
