import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Race } from '@firestone-hs/reference-data';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { BgsBattleInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-info';
import { BgsBattleOptions } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-options';
import { CardsData } from '@firestone-hs/simulate-bgs-battle/dist/cards/cards-data';
import { SimulationResult } from '@firestone-hs/simulate-bgs-battle/dist/simulation-result';
import { GameSample } from '@firestone-hs/simulate-bgs-battle/dist/simulation/spectator/game-sample';
import Worker from 'worker-loader!../../workers/bgs-simulation.worker';
import { Preferences } from '../../models/preferences';
import { OverwolfService } from '../overwolf.service';
import { PreferencesService } from '../preferences.service';
import { BattlegroundsBattleSimulationEvent } from './store/events/battlegrounds-battle-simulation-event';
import { BattlegroundsStoreEvent } from './store/events/_battlegrounds-store-event';

const BGS_BATTLE_SIMULATION_ENDPOINT = 'https://o5gz4ktmfl.execute-api.us-west-2.amazonaws.com/Prod/{proxy+}';
const BGS_BATTLE_SIMULATION_SAMPLE_ENDPOINT = 'https://bmphmnu4gk.execute-api.us-west-2.amazonaws.com/Prod/{proxy+}';

@Injectable()
export class BgsBattleSimulationService {
	private stateUpdater: EventEmitter<BattlegroundsStoreEvent>;
	private cardsData: CardsData;

	constructor(
		private readonly http: HttpClient,
		private readonly ow: OverwolfService,
		private readonly cards: AllCardsService,
		private readonly prefs: PreferencesService,
	) {
		setTimeout(() => {
			this.stateUpdater = this.ow.getMainWindow().battlegroundsUpdater;
		});
		this.init();
	}

	private async init() {
		await this.cards.initializeCardsDb();
		this.cardsData = new CardsData(this.cards.service, false);
		this.cardsData.inititialize();
	}

	public async startBgsBattleSimulation(battleInfo: BgsBattleInfo, races: readonly Race[]) {
		const prefs = await this.prefs.getPreferences();
		if (!prefs.bgsEnableSimulation) {
			console.log('[bgs-simulation] simulation turned off');
			return;
		}
		const options: BgsBattleOptions = {
			...battleInfo.options,
			validTribes: races,
		} as BgsBattleOptions;
		const battleInfoInput: BgsBattleInfo = {
			...battleInfo,
			options,
		};
		console.log(
			'no-format',
			'[bgs-simulation] battle simulation request prepared',
			battleInfo,
			prefs.bgsEnableSimulation,
			prefs.bgsUseLocalSimulator,
		);

		const result: SimulationResult = prefs.bgsUseLocalSimulator
			? await this.simulateLocalBattle(battleInfoInput, prefs)
			: ((await this.http.post(BGS_BATTLE_SIMULATION_ENDPOINT, battleInfoInput).toPromise()) as SimulationResult);
		console.log('[bgs-simulation] battle simulation result', result);
		this.stateUpdater.next(new BattlegroundsBattleSimulationEvent(result));
	}

	public async getIdForSimulationSample(sample: GameSample): Promise<string> {
		console.log('calling sample endpoint', sample);
		try {
			const result: any = (await this.http
				.post(BGS_BATTLE_SIMULATION_SAMPLE_ENDPOINT, sample)
				.toPromise()) as string;
			console.log('[bgs-simulation] id for simulation sample', result);
			return result?.id;
		} catch (e) {
			console.error('[bgs-simulation] could not get if from sample', e.message, sample, e);
			return null;
		}
	}

	private async simulateLocalBattle(battleInfo: BgsBattleInfo, prefs: Preferences): Promise<SimulationResult> {
		return new Promise<SimulationResult>(resolve => {
			const worker = new Worker();
			worker.onmessage = (ev: MessageEvent) => {
				worker.terminate();
				resolve(JSON.parse(ev.data));
			};
			worker.postMessage({
				...battleInfo,
				options: {
					...battleInfo.options,
					numberOfSimulations: Math.floor(prefs.bgsSimulatorNumberOfSims),
				},
			} as BgsBattleInfo);
		});
	}
}
