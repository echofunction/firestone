import {
	BgsPostMatchStats,
	parseBattlegroundsGame,
	parseHsReplayString,
	Replay,
} from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
import { BgsPlayer } from '../../core/src/js/models/battlegrounds/bgs-player';
import { replayXmlTest } from './replay';

describe('BGS Replay-parser - basic test', () => {
	test('minion damage is correct', async () => {
		const replayXml = replayXmlTest;
		console.time('start parsing');
		const replay: Replay = parseHsReplayString(replayXml);
		console.timeEnd('startParsing');

		const stats: BgsPostMatchStats = parseBattlegroundsGame(replayXml, BgsPlayer.create({} as BgsPlayer), []);

		expect(stats).not.toBe(null);
		console.debug(stats.damageToEnemyHeroOverTurn);
	});
});
