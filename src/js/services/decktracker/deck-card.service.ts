import { Injectable } from '@angular/core';
import { DeckCard } from '../../models/decktracker/deck-card';
import { DeckState } from '../../models/decktracker/deck-state';
import { GameState } from '../../models/decktracker/game-state';
import { AllCardsService } from '../all-cards.service';

@Injectable()
export class DeckCardService {
	constructor(private cards: AllCardsService) {}

	// Doesn't handle dynamic zones, so should be called before dynamic zones are built
	public fillMissingCardInfo(gameState: GameState): GameState {
		return Object.assign(new GameState(), gameState, {
			playerDeck: this.fillDeck(gameState.playerDeck),
			opponentDeck: this.fillDeck(gameState.opponentDeck),
		} as GameState);
	}

	private fillDeck(deckState: DeckState): DeckState {
		return Object.assign(new DeckState(), deckState, {
			board: this.fillZone(deckState.board),
			deck: this.fillZone(deckState.deck),
			hand: this.fillZone(deckState.hand),
			otherZone: this.fillZone(deckState.otherZone),
		} as DeckState);
	}

	private fillZone(zone: readonly DeckCard[]): readonly DeckCard[] {
		return zone ? zone.map(card => (card.cardId ? this.doFillCard(card) : card)) : zone;
	}

	// private tryFillCard(card: DeckCard): DeckCard {
	// 	return card.cardName || !card.cardId ? card : this.doFillCard(card);
	// }

	private doFillCard(card: DeckCard): DeckCard {
		const dbCard = this.cards.getCard(card.cardId);
		if (!dbCard) {
			return card;
		}
		return Object.assign(new DeckCard(), card, {
			cardName: card.cardName || dbCard.name,
			manaCost: card.manaCost || dbCard.cost,
			rarity: card.rarity || dbCard.rarity ? dbCard.rarity.toLowerCase() : undefined,
		} as DeckCard);
	}
}