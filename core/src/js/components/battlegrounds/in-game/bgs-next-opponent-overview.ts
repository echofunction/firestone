import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Entity } from '@firestone-hs/replay-parser';
import { BgsGame } from '../../../models/battlegrounds/bgs-game';
import { BgsNextOpponentOverviewPanel } from '../../../models/battlegrounds/in-game/bgs-next-opponent-overview-panel';
import { BgsTavernUpgrade } from '../../../models/battlegrounds/in-game/bgs-tavern-upgrade';
import { BgsTriple } from '../../../models/battlegrounds/in-game/bgs-triple';

declare var amplitude: any;

@Component({
	selector: 'bgs-next-opponent-overview',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/battlegrounds/in-game/bgs-next-opponent-overview.component.scss`,
	],
	template: `
		<div class="next-opponent-overview">
			<div class="header">
				<div class="portrait">
					<img [src]="icon" class="portrait" />
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
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsNextOpponentOverviewComponent {
	icon: string;
	name: string;
	tavernTier: string;
	boardMinions: readonly Entity[];
	tavernUpgrades: readonly BgsTavernUpgrade[];
	triples: readonly BgsTriple[];

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

	private updateInfo() {
		if (!this._panel || !this._game) {
			return;
		}
		const opponent = this._game.players.find(player => player.cardId === this._panel.opponentOverview.cardId);
		console.log('found opponent', opponent, this._panel, this._game);
		this.name = opponent.name;
		this.tavernTier = '' + opponent.getCurrentTavernTier();
		this.boardMinions = opponent.getLastKnownBoardState();
		this.tavernUpgrades = [...opponent.tavernUpgradeHistory].reverse();
		this.triples = [...opponent.tripleHistory].reverse();
	}
}
