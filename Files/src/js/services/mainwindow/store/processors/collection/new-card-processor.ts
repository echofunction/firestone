import { Processor } from "../processor";
import { MainWindowState } from "../../../../../models/mainwindow/main-window-state";
import { BinderState } from "../../../../../models/mainwindow/binder-state";
import { IndexedDbService } from "../../../../collection/indexed-db.service";
import { PityTimer } from "../../../../../models/pity-timer";
import { Set, SetCard } from "../../../../../models/set";
import { NewCardEvent } from "../../events/collection/new-card-event";
import { MemoryInspectionService } from "../../../../plugins/memory-inspection.service";
import { Card } from "../../../../../models/card";
import { CardHistory } from "../../../../../models/card-history";
import { CardHistoryStorageService } from "../../../../collection/card-history-storage.service";
import { CollectionManager } from "../../../../collection/collection-manager.service";
import { PackHistoryService } from "../../../../collection/pack-history.service";
import { AllCardsService } from "../../../../all-cards.service";

// TODO: for now we just bruteforce rebuild the full collection on each new card event, 
// which is highly unefficient. Maybe we should do things a little be smarter
export class NewCardProcessor implements Processor {

    constructor(
        private indexedDb: IndexedDbService, 
        private memoryReading: MemoryInspectionService,
        private cardHistoryStorage: CardHistoryStorageService,
        private pityTimer: PackHistoryService,
        private cards: AllCardsService) { }

    public async process(event: NewCardEvent, currentState: MainWindowState): Promise<MainWindowState> {
        const collection = await this.memoryReading.getCollection();
		if (collection && collection.length > 0) {
			await this.indexedDb.saveCollection(collection);
        }
        const dbCard = this.cards.getCard(event.card.id);
		const relevantCount = event.type == 'GOLDEN' ? event.card.premiumCount : event.card.count;
		const history = this.isDust(event.card, event.type)
				? new CardHistory(dbCard.id, dbCard.name, dbCard.rarity, this.getDust(dbCard, event.type), event.type == 'GOLDEN', false, -1)
				: new CardHistory(dbCard.id, dbCard.name, dbCard.rarity, 0, event.type == 'GOLDEN', true, relevantCount);
		await this.cardHistoryStorage.newHistory(history);
        const newBinder = Object.assign(new BinderState(), currentState.binder, {
            allSets: await this.buildSetsFromCollection(collection),
            cardHistory: [history, ...currentState.binder.cardHistory] as ReadonlyArray<CardHistory>,
        } as BinderState);
        return Object.assign(new MainWindowState(), currentState, {
            binder: newBinder,
        } as MainWindowState)
    }

	private async buildSetsFromCollection(collection: Card[]): Promise<ReadonlyArray<Set>> {
		const pityTimers = await this.pityTimer.getPityTimers();
        return this.cards.getAllSets()
                .map((set) => ({ set: set, pityTimer: pityTimers.filter(timer => timer.setId == set.id)[0]}))
                .map((set) => this.mergeSet(collection, set.set, set.pityTimer));
	}

	private mergeSet(collection: Card[], set: Set, pityTimer: PityTimer): Set {
		const updatedCards: SetCard[] = this.mergeFullCards(collection, set.allCards);
		const ownedLimitCollectibleCards = updatedCards
			.map((card: SetCard) => card.getNumberCollected())
			.reduce((c1, c2) => c1 + c2, 0);
		const ownedLimitCollectiblePremiumCards = updatedCards
			.map((card: SetCard) => card.getNumberCollectedPremium())
			.reduce((c1, c2) => c1 + c2, 0);
		return new Set(
			set.id,
			set.name,
			set.standard,
			updatedCards,
			pityTimer,
			ownedLimitCollectibleCards,
			ownedLimitCollectiblePremiumCards);
	}

	private mergeFullCards(collection: Card[], setCards: ReadonlyArray<SetCard>): SetCard[] {
		return setCards.map((card: SetCard) => {
			const collectionCard: Card = collection.find((collectionCard: Card) => collectionCard.id === card.id);
			const ownedPremium = collectionCard ? collectionCard.premiumCount : 0;
			const ownedNonPremium = collectionCard ? collectionCard.count : 0;
			return new SetCard(card.id, card.name, card.cardClass, card.rarity, card.cost, ownedNonPremium, ownedPremium);
		});
	}

	private isDust(card: Card, type: string):boolean {
		// Card is not in collection at all
		// Should never occur
		if (!card) {
			console.warn('Should never have a missing card in collection, since the collection is retrieved after card pack opening');
			return false;
		}

		let dbCard = this.cards.getCard(card.id);
		if (!dbCard) {
			console.warn('unknown card', card.id, card);
			return false;
		}
		// The collection is updated immediately, so when we query it the new card has already been inserted
		if (type == 'NORMAL' && (dbCard.rarity === 'Legendary' && card.count >= 2) || card.count >= 3) {
			return true;
		}
		if (type == 'GOLDEN' && (dbCard.rarity === 'Legendary' && card.premiumCount >= 2) || card.premiumCount >= 3) {
			return true;
		}
		return false;
	}

	private getDust(dbCard: any, type: string) {
		let dust = this.dustFor(dbCard.rarity.toLowerCase());
		return type == 'GOLDEN' ? dust * 4 : dust;
	}

	private dustFor(rarity: string): number {
		switch (rarity) {
			case 'legendary':
				return 400;
			case 'epic':
				return 100;
			case 'rare': 
				return 20;
			default:
				return 5;
		}
	}
}