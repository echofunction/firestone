import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	ViewRef,
} from '@angular/core';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { Subscription } from 'rxjs';
import { CardTooltipPositionType } from '../../directives/card-tooltip-position.type';
import { BoardSecret } from '../../models/decktracker/board-secret';
import { DeckCard } from '../../models/decktracker/deck-card';
import { SecretOption } from '../../models/decktracker/secret-option';
import { VisualDeckCard } from '../../models/decktracker/visual-deck-card';
import { Events } from '../../services/events.service';
import { OverwolfService } from '../../services/overwolf.service';

@Component({
	selector: 'secrets-helper-list',
	styleUrls: [
		'../../../css/global/components-global.scss',
		'../../../css/component/secrets-helper/secrets-helper-list.component.scss',
		'../../../css/component/decktracker/overlay/dim-overlay.scss',
		`../../../css/global/scrollbar-decktracker-overlay.scss`,
	],
	template: `
		<perfect-scrollbar class="secrets-helper-list" (scroll)="onScroll($event)" [ngClass]="{ 'active': isScroll }">
			<ul class="card-list">
				<li *ngFor="let card of cards; trackBy: trackCard">
					<deck-card
						[card]="card"
						[tooltipPosition]="_tooltipPosition"
						[colorManaCost]="colorManaCost"
						[colorClassCards]="true"
					></deck-card>
				</li>
			</ul>
		</perfect-scrollbar>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretsHelperListComponent implements AfterViewInit, OnDestroy {
	@Input() colorManaCost: boolean;
	@Input() cardsGoToBottom: boolean;

	_tooltipPosition: CardTooltipPositionType;
	_secrets: readonly BoardSecret[];
	cards: readonly DeckCard[];
	isScroll: boolean;

	@Input() set tooltipPosition(value: CardTooltipPositionType) {
		// console.log('[decktracker-deck-list] setting tooltip position', value);
		this._tooltipPosition = value;
	}

	@Input() set secrets(value: readonly BoardSecret[]) {
		this._secrets = value;
		this.updateCards();
	}

	private preferencesSubscription: Subscription;

	constructor(
		private el: ElementRef,
		private cdr: ChangeDetectorRef,
		private events: Events,
		private ow: OverwolfService,
		private allCards: AllCardsService,
	) {}

	ngAfterViewInit() {
		const preferencesEventBus: EventEmitter<any> = this.ow.getMainWindow().preferencesEventBus;
		this.preferencesSubscription = preferencesEventBus.subscribe(event => {
			this.refreshScroll();
		});
	}

	ngOnDestroy() {
		this.preferencesSubscription.unsubscribe();
	}

	// Prevent the window from being dragged around if user scrolls with click
	@HostListener('mousedown', ['$event'])
	onHistoryClick(event: MouseEvent) {
		// console.log('handling history click', event);
		const rect = this.el.nativeElement.querySelector('.card-list').getBoundingClientRect();
		// console.log('element rect', r ect);
		const scrollbarWidth = 5;
		if (event.offsetX >= rect.width - scrollbarWidth) {
			event.stopPropagation();
		}
	}

	onScroll(event) {
		// console.log('scrolling');
		// Force immediate clean of the tooltip
		this.events.broadcast(Events.DECK_HIDE_TOOLTIP, 0);
	}

	refresh() {
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	trackCard(index, card: VisualDeckCard) {
		return card.cardId;
	}

	private updateCards() {
		this.cards = this._secrets ? this.buildCards() : null;
		this.refreshScroll();
	}

	private buildCards(): readonly DeckCard[] {
		if (!this.allCards.getCards() || this.allCards.getCards().length === 0) {
			setTimeout(() => this.updateCards(), 200);
			return;
		}
		const allOptionsList = this._secrets.map(secret => secret.allPossibleOptions).reduce((a, b) => a.concat(b), []);
		// console.log('allOptions', allOptionsList);
		const optionsGroupedByCard = this.groupBy(allOptionsList, (secret: SecretOption) => secret.cardId);
		// console.log('grouped', optionsGroupedByCard);
		const reducedOptions: readonly DeckCard[] = [...optionsGroupedByCard.values()]
			.filter(options => options && options.length > 0)
			.map((options, index) => {
				const validOption = options.some(option => option.isValidOption);
				const refOption = options[0].update({
					isValidOption: validOption,
				} as SecretOption);
				return { index: index, data: refOption };
			})
			.sort((a, b) => {
				if (this.cardsGoToBottom) {
					if (a.data.isValidOption && !b.data.isValidOption) {
						return -1;
					}
					if (!a.data.isValidOption && b.data.isValidOption) {
						return 1;
					}
				}
				return a.index - b.index;
			})
			.map(refOption => refOption.data)
			.map(refOption => {
				const dbCard = this.allCards.getCard(refOption.cardId);
				return VisualDeckCard.create({
					cardId: refOption.cardId,
					cardName: dbCard.name,
					manaCost: dbCard.cost,
					rarity: dbCard.rarity ? dbCard.rarity.toLowerCase() : 'free',
					highlight: refOption.isValidOption ? 'normal' : 'dim',
					cardClass: dbCard.cardClass,
				} as VisualDeckCard);
			});
		// TODO: add an optional filter step based on user preference to see or not the ruled out secrets
		// console.log('reducedOptions', reducedOptions);
		return reducedOptions;
	}

	private refreshScroll() {
		setTimeout(() => {
			const contentHeight = this.el.nativeElement.querySelector('.ps-content').getBoundingClientRect().height;
			const containerHeight = this.el.nativeElement.querySelector('.ps').getBoundingClientRect().height;
			this.isScroll = contentHeight > containerHeight;
			// console.log('isScroll', this.isScroll, containerHeight, contentHeight);
			this.refresh();
		}, 1000);
	}

	private groupBy(list, keyGetter): Map<string, SecretOption[]> {
		const map = new Map();
		list.forEach(item => {
			const key = keyGetter(item);
			const collection = map.get(key);
			if (!collection) {
				map.set(key, [item]);
			} else {
				collection.push(item);
			}
		});
		return map;
	}
}
