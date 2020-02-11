import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewRef } from '@angular/core';
import { CardTooltipPositionType } from '../../../directives/card-tooltip-position.type';
import { DeckZone } from '../../../models/decktracker/view/deck-zone';
import { VisualDeckCard } from '../../../models/decktracker/visual-deck-card';

@Component({
	selector: 'deck-zone',
	styleUrls: [
		'../../../../css/global/components-global.scss',
		'../../../../css/component/decktracker/overlay/deck-zone.component.scss',
		'../../../../css/component/decktracker/overlay/dim-overlay.scss',
	],
	template: `
		<div class="deck-zone {{ className }}">
			<div class="zone-name-container" *ngIf="zoneName" (mousedown)="toggleZone()">
				<div class="zone-name">
					<span>{{ zoneName }} ({{ cardsInZone }})</span>
					<div *ngIf="showWarning" class="warning">
						<svg
							helpTooltip="The actual cards in this deck are randomly chosen from all the cards in the list below"
						>
							<use xlink:href="/Files/assets/svg/sprite.svg#attention" />
						</svg>
					</div>
				</div>
				<!-- TODO: collapse caret -->
				<i class="collapse-caret {{ open ? 'open' : 'close' }}">
					<svg class="svg-icon-fill">
						<use xlink:href="assets/svg/sprite.svg#collapse_caret" />
					</svg>
				</i>
			</div>
			<ul class="card-list" *ngIf="open">
				<li *ngFor="let card of cards; trackBy: trackCard">
					<deck-card
						[card]="card"
						[tooltipPosition]="_tooltipPosition"
						[colorManaCost]="colorManaCost"
					></deck-card>
				</li>
			</ul>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckZoneComponent {
	@Input() colorManaCost: boolean;
	@Input() set tooltipPosition(value: CardTooltipPositionType) {
		// console.log('[deck-zone] setting tooltip position', value);
		this._tooltipPosition = value;
	}

	_tooltipPosition: CardTooltipPositionType;
	className: string;
	zoneName: string;
	showWarning: boolean;
	cardsInZone = 0;
	cards: readonly VisualDeckCard[];
	open = true;

	constructor(private cdr: ChangeDetectorRef) {}

	@Input('zone') set zone(zone: DeckZone) {
		this.className = zone.id;
		this.zoneName = zone.name;
		this.showWarning = zone.showWarning;
		// console.log('setting zone', zone);
		const cardsToDisplay = zone.sortingFunction ? [...zone.cards].sort(zone.sortingFunction) : zone.cards;
		this.cardsInZone = zone.numberOfCards;
		// console.log('setting cards in zone', zone, cardsToDisplay, this.cardsInZone);
		const grouped: Map<string, VisualDeckCard[]> = this.groupBy(
			cardsToDisplay,
			(card: VisualDeckCard) => card.cardId,
		);
		this.cards = Array.from(grouped.values(), cards => {
			const creatorCardIds: readonly string[] = [
				...new Set(
					cards
						.map(card => card.creatorCardIds)
						.reduce((a, b) => a.concat(b), [])
						.filter(creator => creator),
				),
			];
			// console.log('creator card ids', creatorCardIds, cards);
			return Object.assign(new VisualDeckCard(), cards[0], {
				totalQuantity: cards.length,
				creatorCardIds: creatorCardIds,
			} as VisualDeckCard);
		});
		// console.log('setting cards in zone', zone, cardsToDisplay, this.cardsInZone, this.cards, grouped);
	}

	toggleZone() {
		this.open = !this.open;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	trackCard(index, card: VisualDeckCard) {
		return card.cardId;
	}

	private groupBy(list, keyGetter): Map<string, VisualDeckCard[]> {
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