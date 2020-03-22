import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BgsBattleInfo } from '../../models/battlegrounds/bgs-battle-info';
import { BgsBattleSimulationResult } from '../../models/battlegrounds/bgs-battle-simulation-result';
import { OverwolfService } from '../overwolf.service';
import { BattlegroundsBattleSimulationEvent } from './store/events/battlegrounds-battle-simulation-event';
import { BattlegroundsStoreEvent } from './store/events/_battlegrounds-store-event';

const BGS_BATTLE_SIMULATION_ENDPOINT = 'https://tsu2ztwayc.execute-api.us-west-2.amazonaws.com/Prod/{proxy+}';

@Injectable()
export class BgsBattleSimulationService {
	private stateUpdater: EventEmitter<BattlegroundsStoreEvent>;

	constructor(private readonly http: HttpClient, private readonly ow: OverwolfService) {
		setTimeout(() => {
			this.stateUpdater = this.ow.getMainWindow().battlegroundsUpdater;
		});
	}

	public async startBgsBattleSimulation(battleInfo: BgsBattleInfo) {
		console.log('[bgs-simulation] battle simulation request sent', battleInfo);
		const result: BgsBattleSimulationResult = (await this.http
			.post(BGS_BATTLE_SIMULATION_ENDPOINT, battleInfo)
			.toPromise()) as BgsBattleSimulationResult;
		console.log('[bgs-simulation] battle simulation result', result);
		this.stateUpdater.next(new BattlegroundsBattleSimulationEvent(result));
	}
}
