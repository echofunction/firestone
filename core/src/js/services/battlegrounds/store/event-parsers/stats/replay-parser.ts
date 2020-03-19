import { Replay } from '@firestone-hs/hs-replay-xml-parser';
import { BlockType, CardType, GameTag, Race, Step, Zone } from '@firestone-hs/reference-data';
import { Element } from 'elementtree';
import { Map } from 'immutable';
import { BgsCompositionForTurn } from '../../../../../models/battlegrounds/post-match/bgs-composition-for-turn';
import { NumericTurnInfo } from '../../../../../models/battlegrounds/post-match/numeric-turn-info';
import { ParsingStructure } from './parsing-structure';

export const reparseReplay = (
	replay: Replay,
): {
	compositionsOverTurn: readonly BgsCompositionForTurn[];
	rerollsOverTurn: readonly NumericTurnInfo[];
	hpOverTurn: readonly NumericTurnInfo[];
} => {
	const opponentPlayerElement = replay.replay
		.findall('.//Player')
		.find(player => player.get('isMainPlayer') === 'false');
	const opponentPlayerEntityId = opponentPlayerElement.get('id');
	// console.log('mainPlayerEntityId', opponentPlayerEntityId);
	const structure: ParsingStructure = {
		entities: {},
		boardOverTurn: Map.of(),
		rerollOverTurn: Map.of(),
		hpOverTurn: Map.of(),
		currentTurn: 0,
		rerollsForTurn: 0,
		rerollsIds: [],
	};
	parseElement(
		replay.replay.getroot(),
		replay.mainPlayerId,
		opponentPlayerEntityId,
		null,
		{ currentTurn: 0 },
		[compositionForTurnParse(structure), rerollsForTurnParse(structure), hpForTurnParse(structure)],
		[compositionForTurnPopulate(structure, replay), hpForTurnPopulate(structure, replay)],
	);

	const compositionsOverTurn: readonly BgsCompositionForTurn[] = structure.boardOverTurn
		.map((cards: any[], turn: number) => {
			return {
				turn: turn,
				beast: cards.filter(card => card.tribe === Race.BEAST).length,
				demon: cards.filter(card => card.tribe === Race.DEMON).length,
				dragon: cards.filter(card => card.tribe === Race.DRAGON).length,
				mech: cards.filter(card => card.tribe === Race.MECHANICAL).length,
				murloc: cards.filter(card => card.tribe === Race.MURLOC).length,
				blank: cards.filter(card => card.tribe === Race.BLANK || card.tribe === -1).length,
			} as BgsCompositionForTurn;
		})
		.valueSeq()
		.toArray();
	const rerollsOverTurn: readonly NumericTurnInfo[] = structure.rerollOverTurn
		.map(
			(rerolls, turn: number) =>
				({
					turn: turn,
					value: rerolls,
				} as NumericTurnInfo),
		)
		.valueSeq()
		.toArray();
	return {
		compositionsOverTurn: compositionsOverTurn,
		rerollsOverTurn: rerollsOverTurn,
	};
};

const hpForTurnParse = (structure: ParsingStructure) => {
	return element => {
		if (element.tag === 'TagChange' && element.get('cardID') === 'TB_BaconShop_8p_Reroll_Button') {
			structure.rerollsIds = [...structure.rerollsIds, element.get('id')];
		}
		if (
			element.tag === 'Block' &&
			parseInt(element.get('type')) === BlockType.POWER &&
			structure.rerollsIds.indexOf(element.get('entity')) !== -1
		) {
			structure.rerollsForTurn = structure.rerollsForTurn + 1;
		}
	};
};

const rerollsForTurnParse = (structure: ParsingStructure) => {
	return element => {
		if (element.tag === 'FullEntity' && element.get('cardID') === 'TB_BaconShop_8p_Reroll_Button') {
			structure.rerollsIds = [...structure.rerollsIds, element.get('id')];
		}
		if (
			element.tag === 'Block' &&
			parseInt(element.get('type')) === BlockType.POWER &&
			structure.rerollsIds.indexOf(element.get('entity')) !== -1
		) {
			structure.rerollsForTurn = structure.rerollsForTurn + 1;
		}
	};
};

const rerollsForTurnPopulate = (structure: ParsingStructure, replay: Replay) => {
	return currentTurn => {
		structure.rerollOverTurn = structure.rerollOverTurn.set(currentTurn, structure.rerollsForTurn);
		structure.rerollsForTurn = 0;
	};
};

const compositionForTurnParse = (structure: ParsingStructure) => {
	return element => {
		if (element.tag === 'FullEntity') {
			structure.entities[element.get('id')] = {
				cardId: element.get('cardID'),
				controller: parseInt(element.find(`.Tag[@tag='${GameTag.CONTROLLER}']`)?.get('value') || '-1'),
				zone: parseInt(element.find(`.Tag[@tag='${GameTag.ZONE}']`)?.get('value') || '-1'),
				zonePosition: parseInt(element.find(`.Tag[@tag='${GameTag.ZONE_POSITION}']`)?.get('value') || '-1'),
				cardType: parseInt(element.find(`.Tag[@tag='${GameTag.CARDTYPE}']`)?.get('value') || '-1'),
				tribe: parseInt(element.find(`.Tag[@tag='${GameTag.CARDRACE}']`)?.get('value') || '-1'),
			};
		}
		if (structure.entities[element.get('entity')]) {
			if (parseInt(element.get('tag')) === GameTag.CONTROLLER) {
				structure.entities[element.get('entity')].controller = parseInt(element.get('value'));
			}
			if (parseInt(element.get('tag')) === GameTag.ZONE) {
				// console.log('entity', child.get('entity'), structure.entities[child.get('entity')]);
				structure.entities[element.get('entity')].zone = parseInt(element.get('value'));
			}
			if (parseInt(element.get('tag')) === GameTag.ZONE_POSITION) {
				// console.log('entity', child.get('entity'), structure.entities[child.get('entity')]);
				structure.entities[element.get('entity')].zonePosition = parseInt(element.get('value'));
			}
		}
	};
};

const compositionForTurnPopulate = (structure: ParsingStructure, replay: Replay) => {
	return currentTurn => {
		const playerEntitiesOnBoard = Object.values(structure.entities)
			.map(entity => entity as any)
			.filter(entity => entity.controller === replay.mainPlayerId)
			.filter(entity => entity.zone === Zone.PLAY)
			.filter(entity => entity.cardType === CardType.MINION)
			.map(entity => ({
				cardId: entity.cardId,
				tribe: entity.tribe,
			}));
		structure.boardOverTurn = structure.boardOverTurn.set(currentTurn, playerEntitiesOnBoard);
		console.log('updated', structure.boardOverTurn.toJS(), playerEntitiesOnBoard);
	};
};

const parseElement = (
	element: Element,
	mainPlayerId: number,
	opponentPlayerEntityId: string,
	parent: Element,
	turnCountWrapper,
	parseFunctions,
	populateFunctions,
) => {
	parseFunctions.forEach(parseFunction => parseFunction(element));
	if (element.tag === 'TagChange') {
		if (
			parseInt(element.get('tag')) === GameTag.NEXT_STEP &&
			parseInt(element.get('value')) === Step.MAIN_START_TRIGGERS
		) {
			// console.log('considering parent', parent.get('entity'), parent);
			if (parent && parent.get('entity') === opponentPlayerEntityId) {
				populateFunctions.forEach(populateFunction => populateFunction(turnCountWrapper.currentTurn));
				turnCountWrapper.currentTurn++;
			}
			// console.log('board for turn', structure.currentTurn, mainPlayerId, '\n', playerEntitiesOnBoard);
		}
	}

	const children = element.getchildren();
	if (children && children.length > 0) {
		for (const child of children) {
			parseElement(
				child,
				mainPlayerId,
				opponentPlayerEntityId,
				element,
				turnCountWrapper,
				parseFunctions,
				populateFunctions,
			);
		}
	}
};
