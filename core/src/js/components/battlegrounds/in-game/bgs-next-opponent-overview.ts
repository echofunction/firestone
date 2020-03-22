import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	Input,
	Renderer2,
	ViewRef,
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
		`../../../../css/global/scrollbar.scss`,
	],
	template: `
		<div class="container">
			<div class="left">
				<bgs-hero-face-off *ngFor="let faceOff of opponentFaceOffs" [faceOff]="faceOff"></bgs-hero-face-off>
			</div>
			<div class="content">
				<div class="next-opponent-overview" *ngFor="let opponentInfo of opponentInfos">
					<div class="header" (click)="toggleDisplayBody(opponentInfo)">
						<div class="portrait">
							<img [src]="opponentInfo.icon" class="icon" />
							<div class="name">{{ opponentInfo.name }}</div>
							<!-- <img [src]="taverTierIcon" class="tavern-tier" /> -->
							<div class="tavern-tier">Tavern: {{ opponentInfo.tavernTier }}</div>
						</div>
						<board [entities]="opponentInfo.boardMinions" *ngIf="opponentInfo.boardMinions"></board>
					</div>
					<div class="body" *ngIf="opponentInfo.displayBody">
						<div class="tavern-upgrades">
							<div *ngFor="let upgrade of opponentInfo.tavernUpgrades">
								Turn {{ upgrade.turn }}: Upgrade tier {{ upgrade.tavernTier }}
							</div>
						</div>
						<div class="triple-tiers">
							<div *ngFor="let triple of opponentInfo.triples">
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
	opponentInfos: readonly OpponentInfo[] = [];
	opponentFaceOffs: readonly OpponentFaceOff[];

	private _panel: BgsNextOpponentOverviewPanel;
	private _game: BgsGame;

	@Input() set panel(value: BgsNextOpponentOverviewPanel) {
		this._panel = value;
		this.updateInfo();
	}

	@Input() set game(value: BgsGame) {
		this._game = value;
		this.updateInfo();
	}

	constructor(
		private readonly el: ElementRef,
		private readonly renderer: Renderer2,
		private readonly cdr: ChangeDetectorRef,
	) {}

	async ngAfterViewInit() {
		this.onResize();
	}

	toggleDisplayBody(opponentInfo: OpponentInfo) {
		opponentInfo.displayBody = !opponentInfo.displayBody;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	@HostListener('window:resize')
	onResize() {
		const boardContainers = this.el.nativeElement.querySelectorAll('board');
		for (const boardContainer of boardContainers) {
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
	}

	private updateInfo() {
		if (!this._panel || !this._game) {
			return;
		}
		const nextOpponent = this._game.players.find(player => player.cardId === this._panel.opponentOverview.cardId);
		if (!nextOpponent) {
			return;
		}
		const opponents = this._game.players.filter(player => !player.isMainPlayer);
		this.opponentInfos = opponents
			.map(
				opponent =>
					({
						id: opponent.cardId,
						icon: `https://static.zerotoheroes.com/hearthstone/cardart/256x/${opponent.cardId}.jpg`,
						name: opponent.name,
						tavernTier: '' + opponent.getCurrentTavernTier(),
						boardMinions: opponent.getLastKnownBoardState(),
						tavernUpgrades: [...opponent.tavernUpgradeHistory].reverse(),
						triples: [...opponent.tripleHistory].reverse(),
						displayBody: opponent.cardId === this._panel.opponentOverview.cardId,
					} as OpponentInfo),
			)
			.sort((a, b) =>
				a.id === this._panel.opponentOverview.cardId
					? -1
					: b.id === this._panel.opponentOverview.cardId
					? 1
					: 0,
			);

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

interface OpponentInfo {
	id: string;
	icon: string;
	name: string;
	tavernTier: string;
	boardMinions: readonly Entity[];
	tavernUpgrades: readonly BgsTavernUpgrade[];
	triples: readonly BgsTriple[];
	displayBody: boolean;
}
