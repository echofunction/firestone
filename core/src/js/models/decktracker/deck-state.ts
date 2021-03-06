import { CardIds } from '@firestone-hs/reference-data';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { AttackOnBoard } from './attack-on-board';
import { BoardSecret } from './board-secret';
import { DeckCard } from './deck-card';
import { HeroCard } from './hero-card';
import { DynamicZone } from './view/dynamic-zone';

export class DeckState {
	private static readonly GALAKROND_CARD_IDS = [
		CardIds.Collectible.Priest.GalakrondTheUnspeakable,
		CardIds.NonCollectible.Priest.GalakrondtheUnspeakable_GalakrondTheApocalypseToken,
		CardIds.NonCollectible.Priest.GalakrondtheUnspeakable_GalakrondAzerothsEndToken,
		CardIds.Collectible.Rogue.GalakrondTheNightmare,
		CardIds.NonCollectible.Rogue.GalakrondtheNightmare_GalakrondTheApocalypseToken,
		CardIds.NonCollectible.Rogue.GalakrondtheNightmare_GalakrondAzerothsEndToken,
		CardIds.Collectible.Shaman.GalakrondTheTempest,
		CardIds.NonCollectible.Shaman.GalakrondtheTempest_GalakrondTheApocalypseToken,
		CardIds.NonCollectible.Shaman.GalakrondtheTempest_GalakrondAzerothsEndToken,
		CardIds.Collectible.Warlock.GalakrondTheWretched,
		CardIds.NonCollectible.Warlock.GalakrondtheWretched_GalakrondTheApocalypseToken,
		CardIds.NonCollectible.Warlock.GalakrondtheWretched_GalakrondAzerothsEndToken,
		CardIds.Collectible.Warrior.GalakrondTheUnbreakable,
		CardIds.NonCollectible.Warrior.GalakrondtheUnbreakable_GalakrondTheApocalypseToken,
		CardIds.NonCollectible.Warrior.GalakrondtheUnbreakable_GalakrondAzerothsEndToken,
	];
	private static readonly POGO_CARD_IDS = [
		CardIds.Collectible.Rogue.PogoHopper,
		CardIds.NonCollectible.Rogue.PogoHopper,
		CardIds.NonCollectible.Rogue.PogoHopperTavernBrawl,
	];

	readonly isFirstPlayer: boolean;
	readonly isActivePlayer: boolean;
	readonly isOpponent: boolean;
	readonly deckstring?: string;
	readonly name?: string;
	readonly hero?: HeroCard;
	readonly heroPower: DeckCard;
	readonly weapon: DeckCard;
	readonly deckList: readonly DeckCard[] = [];
	readonly unknownRealCardsInDeck: boolean;
	// This is too cumbersome to compute for the opponent deck when the decklist is known,
	// so we just read it form the game entities
	readonly cardsLeftInDeck: number;
	readonly showDecklistWarning: boolean;

	readonly secrets: readonly BoardSecret[] = [];
	readonly secretHelperActive: boolean = true;

	readonly totalAttackOnBoard: AttackOnBoard;
	readonly galakrondInvokesCount: number = 0;
	readonly cthunSize: number = 0;
	readonly jadeGolemSize: number = 0;
	readonly pogoHopperSize: number = 0;
	readonly fatigue: number = 0;
	// readonly secretHelperActiveHover: boolean = false;

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

	// TODO: Probably not the place for these methods
	public containsGalakrond(allCards?: AllCardsService): boolean {
		const allCardsInDeck = [...this.deckList, ...this.hand, ...this.deck, ...this.board, ...this.otherZone];
		const isGalakrond = allCardsInDeck
			.filter(card => card.cardId)
			.some(
				card =>
					DeckState.GALAKROND_CARD_IDS.indexOf(card.cardId) !== -1 ||
					(allCards &&
						allCards.getCard(card.cardId)?.text &&
						allCards.getCard(card.cardId)?.text?.indexOf('Invoke Galakrond') !== -1),
			);
		return isGalakrond;
	}

	public containsCthun(allCards: AllCardsService): boolean {
		const allCardsInDeck = [...this.deckList, ...this.hand, ...this.deck, ...this.board, ...this.otherZone];
		const isCthun = allCardsInDeck
			.filter(card => card.cardId)
			.some(
				card =>
					card.cardId === CardIds.Collectible.Neutral.Cthun ||
					(allCards &&
						allCards.getCard(card.cardId)?.text &&
						allCards.getCard(card.cardId)?.text?.indexOf("C'Thun") !== -1),
			);
		return isCthun;
	}

	public containJade(allCards?: AllCardsService): boolean {
		const allCardsInDeck = [...this.deckList, ...this.hand, ...this.deck, ...this.board, ...this.otherZone];
		const isJade = allCardsInDeck
			.filter(card => card.cardId)
			.some(
				card =>
					allCards &&
					allCards.getCard(card.cardId)?.referencedTags &&
					allCards.getCard(card.cardId)?.referencedTags.includes('JADE_GOLEM'),
			);
		return isJade;
	}

	public containsPogoHopper(): boolean {
		const allCardsInDeck = [...this.deckList, ...this.hand, ...this.deck, ...this.board, ...this.otherZone];
		const isPogo = allCardsInDeck
			.filter(card => card.cardId)
			.some(card => DeckState.POGO_CARD_IDS.indexOf(card.cardId) !== -1);
		return isPogo;
	}
}
