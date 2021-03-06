import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GameTag } from '@firestone-hs/reference-data';
import { AllCardsService, Entity } from '@firestone-hs/replay-parser';

@Component({
	selector: 'minion-icon',
	styleUrls: [`../../../css/component/battlegrounds/minion-icon.component.scss`],
	template: `
		<div class="minion-icon" [ngClass]="{ 'premium': premium }">
			<img [src]="icon" class="icon" />
			<div class="frame" [inlineSVG]="frameSvg"></div>
			<tavern-level-icon [level]="tavernTier" class="tavern"></tavern-level-icon>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinionIconComponent {
	// cardId: string;
	premium: boolean;
	tavernTier: number;
	icon: string;
	frameSvg: string;

	private _entity: Entity;

	@Input() set entity(value: Entity) {
		// console.log(
		// 	'setting entity',
		// 	value.cardID,
		// 	value.getTag(GameTag.PREMIUM),
		// 	value.tags.toJS(),
		// 	value.tags,
		// 	value,
		// );
		this._entity = value;
		// this.cardId = value.cardID;
		this.premium = value.getTag(GameTag.PREMIUM) === 1;
		this.tavernTier = this.allCards.getCard(value.cardID)?.techLevel;
		this.icon = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${value.cardID}.jpg`;
		this.frameSvg = this.premium
			? '/Files/assets/svg/bg_ellipsis_premium.svg'
			: '/Files/assets/svg/bg_ellipsis.svg';
		console.log('frameSvg', this.frameSvg);
	}

	constructor(private readonly allCards: AllCardsService) {}
}
