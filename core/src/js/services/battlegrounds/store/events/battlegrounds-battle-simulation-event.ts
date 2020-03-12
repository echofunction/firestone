import { BgsBattleSimulationResult } from '../../../../models/battlegrounds/bgs-battle-simulation-result';
import { BattlegroundsEvent } from './_battlegrounds-event';

export class BattlegroundsBattleSimulationEvent extends BattlegroundsEvent {
	constructor(public readonly result: BgsBattleSimulationResult) {
		super('BattlegroundsBattleSimulationEvent');
	}
}
