import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	Renderer2,
	ViewRef,
} from '@angular/core';
import { SimulationResult } from '@firestone-hs/simulate-bgs-battle/dist/simulation-result';
import { BgsFaceOff } from '../../../models/battlegrounds/bgs-face-off';
import { BgsGame } from '../../../models/battlegrounds/bgs-game';
import { BgsPlayer } from '../../../models/battlegrounds/bgs-player';
import { BgsNextOpponentOverviewPanel } from '../../../models/battlegrounds/in-game/bgs-next-opponent-overview-panel';

declare let amplitude: any;

@Component({
	selector: 'bgs-next-opponent-overview',
	styleUrls: [
		`../../../../css/global/reset-styles.scss`,
		`../../../../css/component/battlegrounds/in-game/bgs-next-opponent-overview.component.scss`,
		`../../../../css/global/scrollbar.scss`,
	],
	template: `
		<div class="container">
			<div class="content empty-state" *ngIf="!opponents || !opponents[0]">
				<i>
					<svg>
						<use xlink:href="/Files/assets/svg/sprite.svg#empty_state_tracker" />
					</svg>
				</i>
				<span class="title">Nothing here yet</span>
				<span class="subtitle">Pick a hero and wait for your opponents!</span>
			</div>
			<div class="content" *ngIf="opponents && opponents[0]">
				<bgs-opponent-overview-big
					[opponent]="opponents[0]"
					[currentTurn]="currentTurn"
					[enableSimulation]="enableSimulation"
					[nextBattle]="nextBattle"
					[battleSimulationStatus]="battleSimulationStatus"
				></bgs-opponent-overview-big>
				<div class="other-opponents">
					<div class="subtitle">Other opponents</div>
					<div class="opponents" scrollable>
						<bgs-opponent-overview
							*ngFor="let opponent of otherOpponents; trackBy: trackByOpponentInfoFn"
							[opponent]="opponent"
							[currentTurn]="currentTurn"
						></bgs-opponent-overview>
					</div>
				</div>
			</div>
			<div class="left">
				<div class="title" helpTooltip="Recap of all the encounters you had with the other players">
					Score Board
				</div>
				<bgs-hero-face-offs
					[faceOffs]="faceOffs"
					[players]="players"
					[nextOpponentCardId]="nextOpponentCardId"
				></bgs-hero-face-offs>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsNextOpponentOverviewComponent {
	players: readonly BgsPlayer[];
	opponents: readonly BgsPlayer[];
	otherOpponents: readonly BgsPlayer[];
	faceOffs: readonly BgsFaceOff[];
	currentTurn: number;
	nextBattle: SimulationResult;
	battleSimulationStatus: 'empty' | 'waiting-for-result' | 'done';
	nextOpponentCardId: string;
	mmr: number;

	@Input() enableSimulation: boolean;

	private _panel: BgsNextOpponentOverviewPanel;
	private _game: BgsGame;

	@Input() set panel(value: BgsNextOpponentOverviewPanel) {
		if (value && !value.opponentOverview) {
			// console.log('invalid panel', value);
			return;
		}
		if (value === this._panel) {
			return;
		}
		this._panel = value;
		this.updateInfo();
	}

	@Input() set game(value: BgsGame) {
		this._game = value;
		this.mmr = value ? value.mmrAtStart : undefined;
		this.updateInfo();
	}

	constructor(
		private readonly el: ElementRef,
		private readonly renderer: Renderer2,
		private readonly cdr: ChangeDetectorRef,
	) {}

	ngAfterViewInit() {
		// console.log('after view init in next-opponent(view');
	}

	trackByOpponentInfoFn(index, item: BgsPlayer) {
		return item.cardId;
	}

	private updateInfo() {
		if (!this._panel || !this._game || !this._panel.opponentOverview) {
			return;
		}
		this.currentTurn = this._game.currentTurn;
		const nextOpponent = this._game.players.find(player => player.cardId === this._panel.opponentOverview.cardId);
		if (!nextOpponent) {
			return;
		}
		this.players = this._game.players;
		this.nextOpponentCardId = this._panel.opponentOverview.cardId;
		this.nextBattle = this._game.battleResult;
		this.battleSimulationStatus = this._game.battleInfoStatus;
		this.faceOffs = this._game.faceOffs;
		this.opponents = this._game.players
			.filter(player => !player.isMainPlayer)
			.sort((a, b) => {
				if (a.leaderboardPlace < b.leaderboardPlace) {
					return -1;
				}
				if (b.leaderboardPlace < a.leaderboardPlace) {
					return 1;
				}
				if (a.damageTaken < b.damageTaken) {
					return -1;
				}
				if (b.damageTaken < a.damageTaken) {
					return 1;
				}
				return 0;
			})
			.sort((a, b) => (a.cardId === this.nextOpponentCardId ? -1 : b.cardId === this.nextOpponentCardId ? 1 : 0));
		this.otherOpponents = this.opponents.slice(1);
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}
}
