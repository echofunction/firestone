import { BoardSecret } from './board-secret';
import { DeckCard } from './deck-card';
import { HeroCard } from './hero-card';
import { DynamicZone } from './view/dynamic-zone';

export class DeckState {
	readonly isFirstPlayer: boolean;
	readonly isOpponent: boolean;
	readonly deckstring?: string;
	readonly name?: string;
	readonly hero?: HeroCard;
	readonly heroPower: DeckCard;
	readonly deckList: readonly DeckCard[] = [];
	readonly unknownRealCardsInDeck: boolean;

	readonly secrets: readonly BoardSecret[] = [];

	// Graveyard is not so easy in fact - we want to know the cards that
	// can be interacted with, which means dead minions for Priest, or
	// discarded cards for warlock (if the warlock decks contains specific
	// cards)
	// readonly graveyard: ReadonlyArray<DeckCard> = [];
	readonly hand: readonly DeckCard[] = [];
	readonly deck: readonly DeckCard[] = [];
	readonly board: readonly DeckCard[] = [];
	readonly otherZone: readonly DeckCard[] = [];
	readonly dynamicZones: readonly DynamicZone[] = [];

	public static create(value: DeckState): DeckState {
		return Object.assign(new DeckState(), value);
	}

	public update(value: DeckState): DeckState {
		return Object.assign(new DeckState(), this, value);
	}
}
