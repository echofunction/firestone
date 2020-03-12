import { EventEmitter, Injectable } from '@angular/core';
import { BgsGlobalStats } from '../../models/battlegrounds/stats/bgs-global-stats';
import { GameStats } from '../../models/mainwindow/stats/game-stats';
import { Events } from '../events.service';
import { OverwolfService } from '../overwolf.service';
import { BgsGlobalStatsService } from './bgs-global-stats.service';

@Injectable()
export class BgsInitService {
	private stateUpdater: EventEmitter<BattlegroundsStoreEvent>;

	constructor(
		private readonly events: Events,
		private readonly bgsGlobalStats: BgsGlobalStatsService,
		private readonly ow: OverwolfService,
	) {
		this.init();
		setTimeout(() => {
			this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
		});
	}

	private async init() {
		const bgsGlobalStats: BgsGlobalStats = await this.bgsGlobalStats.loadGlobalStats();
		const matchStats: GameStats = (await this.events.on(Events.MATCH_STATS_UPDATED).toPromise()).data[0];
		this.stateUpdater.next(new BgsInitEvent(matchStats, bgsGlobalStats));
	}
}
