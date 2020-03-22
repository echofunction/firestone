import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostListener,
	Input,
	Renderer2,
} from '@angular/core';
import { Entity } from '@firestone-hs/replay-parser';
import { BgsGame } from '../../../models/battlegrounds/bgs-game';
import { BgsNextOpponentOverviewPanel } from '../../../models/battlegrounds/in-game/bgs-next-opponent-overview-panel';
import { BgsTavernUpgrade } from '../../../models/battlegrounds/in-game/bgs-tavern-upgrade';
import { BgsTriple } from '../../../models/battlegrounds/in-game/bgs-triple';
import { OpponentFaceOff } from './opponent-face-off';

declare var amplitude: any;

@Component({
	selector: 'bgs-next-opponent-overview',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/battlegrounds/in-game/bgs-next-opponent-overview.component.scss`,
	],
	template: `
		<div class="container">
			<div class="left">
				<bgs-hero-face-off *ngFor="let faceOff of opponentFaceOffs" [faceOff]="faceOff"></bgs-hero-face-off>
			</div>
			<div class="content">
				<div class="next-opponent-overview">
					<div class="header">
						<div class="portrait">
							<img [src]="icon" class="icon" />
							<div class="name">{{ name }}</div>
							<!-- <img [src]="taverTierIcon" class="tavern-tier" /> -->
							<div class="tavern-tier">Tavern: {{ tavernTier }}</div>
						</div>
						<board [entities]="boardMinions" *ngIf="boardMinions"></board>
					</div>
					<div class="body">
						<div class="tavern-upgrades">
							<div *ngFor="let upgrade of tavernUpgrades">
								Turn {{ upgrade.turn }}: Upgrade tier {{ upgrade.tavernTier }}
							</div>
						</div>
						<div class="triple-tiers">
							<div *ngFor="let triple of triples">
								Turn {{ triple.turn }}: One tier {{ triple.tierOfTripledMinion }} triple
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsNextOpponentOverviewComponent implements AfterViewInit {
	icon: string;
	name: string;
	tavernTier: string;
	boardMinions: readonly Entity[];
	tavernUpgrades: readonly BgsTavernUpgrade[];
	triples: readonly BgsTriple[];
	opponentFaceOffs: readonly OpponentFaceOff[];

	private _panel: BgsNextOpponentOverviewPanel;
	private _game: BgsGame;

	@Input() set panel(value: BgsNextOpponentOverviewPanel) {
		this._panel = value;
		this.icon = `https://static.zerotoheroes.com/hearthstone/cardart/256x/${value.opponentOverview.cardId}.jpg`;
		this.updateInfo();
	}

	@Input() set game(value: BgsGame) {
		this._game = value;
		this.updateInfo();
	}

	constructor(private readonly el: ElementRef, private readonly renderer: Renderer2) {}

	async ngAfterViewInit() {
		this.onResize();
	}

	@HostListener('window:resize')
	onResize() {
		const boardContainer = this.el.nativeElement.querySelector('board');
		const rect = boardContainer.getBoundingClientRect();
		// console.log('boardContainer', boardContainer, rect);
		// const constrainedByWidth = rect.width <
		const cardElements = boardContainer.querySelectorAll('li');
		// console.log('cardElements', cardElements);
		let cardWidth = rect.width / 8;
		let cardHeight = 1.48 * cardWidth;
		if (cardHeight > rect.height) {
			cardHeight = rect.height;
			cardWidth = cardHeight / 1.48;
		}
		for (const cardElement of cardElements) {
			this.renderer.setStyle(cardElement, 'width', cardWidth + 'px');
			this.renderer.setStyle(cardElement, 'height', cardHeight + 'px');
		}
	}

	private updateInfo() {
		if (!this._panel || !this._game) {
			return;
		}
		const opponent = this._game.players.find(player => player.cardId === this._panel.opponentOverview.cardId);
		console.log('found opponent', opponent, this._panel, this._game);
		if (!opponent) {
			return;
		}
		this.name = opponent.name;
		this.tavernTier = '' + opponent.getCurrentTavernTier();
		this.boardMinions = opponent.getLastKnownBoardState();
		console.log('boardMinions', JSON.stringify(this.boardMinions, null, 4));
		this.tavernUpgrades = [...opponent.tavernUpgradeHistory].reverse();
		this.triples = [...opponent.tripleHistory].reverse();

		const opponents = this._game.players.filter(player => !player.isMainPlayer);
		this.opponentFaceOffs = opponents.map(
			opp =>
				({
					cardId: opp.cardId,
					wins: this._game.faceOffs
						.filter(faceOff => faceOff.playerCardId === this._game.getMainPlayer().cardId)
						.filter(faceOff => faceOff.opponentCardId === opp.cardId)
						.filter(faceOff => faceOff.result === 'won').length,
					losses: this._game.faceOffs
						.filter(faceOff => faceOff.playerCardId === this._game.getMainPlayer().cardId)
						.filter(faceOff => faceOff.opponentCardId === opp.cardId)
						.filter(faceOff => faceOff.result === 'lost').length,
				} as OpponentFaceOff),
		);
	}
}
