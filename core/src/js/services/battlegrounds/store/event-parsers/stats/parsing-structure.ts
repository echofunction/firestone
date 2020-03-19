import { Map } from 'immutable';

export interface ParsingStructure {
	entities: {
		[cardId: string]: {
			cardId: string;
			tribe: number;
			controller: number;
			zone: number;
			zonePosition: number;
			cardType: number;
		};
	};
	currentTurn: number;
	boardOverTurn: Map<number, readonly { cardId: string; tribe: number }[]>;
	rerollOverTurn: Map<number, number>;
	hpOverTurn: Map<number, number>;
	rerollsIds: string[];
	rerollsForTurn: number;
}
