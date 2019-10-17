import { DeckCard } from '../../../models/decktracker/deck-card';
import { DeckState } from '../../../models/decktracker/deck-state';
import { GameState } from '../../../models/decktracker/game-state';
import { GameEvent } from '../../../models/game-event';
import { AllCardsService } from '../../all-cards.service';
import { DeckParserService } from '../deck-parser.service';
import { DeckEvents } from './deck-events';
import { DeckManipulationHelper } from './deck-manipulation-helper';
import { EventParser } from './event-parser';

export class CardRemovedFromDeckParser implements EventParser {
	constructor(private deckParser: DeckParserService, private allCards: AllCardsService) {}

	applies(gameEvent: GameEvent): boolean {
		if (gameEvent.type !== GameEvent.CARD_REMOVED_FROM_DECK) {
			return false;
		}
		const cardId: string = gameEvent.cardId;
		const controllerId: number = gameEvent.controllerId;
		const localPlayer = gameEvent.localPlayer;
		return cardId && controllerId === localPlayer.PlayerId;
	}

	async parse(currentState: GameState, gameEvent: GameEvent): Promise<GameState> {
		const [cardId, controllerId, localPlayer, entityId] = gameEvent.parse();

		const isPlayer = cardId && controllerId === localPlayer.PlayerId;
		const deck = isPlayer ? currentState.playerDeck : currentState.opponentDeck;

		const card = DeckManipulationHelper.findCardInZone(deck.deck, cardId, entityId);
		const previousDeck = deck.deck;
		const newDeck: readonly DeckCard[] = DeckManipulationHelper.removeSingleCardFromZone(
			previousDeck,
			cardId,
			entityId,
		);
		const cardWithZone = Object.assign(new DeckCard(), card, {
			zone: 'SETASIDE',
		} as DeckCard);
		const previousOtherZone = deck.otherZone;
		const newOtherZone: readonly DeckCard[] = DeckManipulationHelper.addSingleCardToZone(
			previousOtherZone,
			cardWithZone,
		);
		const newPlayerDeck = Object.assign(new DeckState(), deck, {
			deck: newDeck,
			otherZone: newOtherZone,
		} as DeckState);
		return Object.assign(new GameState(), currentState, {
			[isPlayer ? 'playerDeck' : 'opponentDeck']: newPlayerDeck,
		});
	}

	event(): string {
		return DeckEvents.CARD_REMOVED_FROM_DECK;
	}
}