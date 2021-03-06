import { ComponentType } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Entity } from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
import { fromJS } from 'immutable';
import { BgsPlayer } from '../../../../models/battlegrounds/bgs-player';
import { BgsBoard } from '../../../../models/battlegrounds/in-game/bgs-board';
import { TwitchBgsHeroOverviewComponent } from './twitch-bgs-hero-overview.component';
import { TwitchBgsBoard, TwitchBgsPlayer } from './twitch-bgs-state';

@Component({
	selector: 'leaderboard-empty-card',
	styleUrls: [
		'../../../../../css/global/components-global.scss',
		'../../../../../css/component/decktracker/overlay/twitch/leaderboard-empty-card.component.scss',
	],
	template: `
		<div
			class="card"
			componentTooltip
			[componentType]="componentType"
			[componentInput]="_bgsPlayer"
			componentTooltipPosition="right"
		>
			<!-- transparent image with 1:1 intrinsic aspect ratio -->
			<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardEmptyCardComponent {
	componentType: ComponentType<any> = TwitchBgsHeroOverviewComponent;

	_bgsPlayer: {
		player: BgsPlayer;
		currentTurn: number;
	};

	_previousPlayer: TwitchBgsPlayer;
	_currentTurn: number;

	@Input() set currentTurn(value: number) {
		if (this._currentTurn === value) {
			return;
		}
		this._currentTurn = value;
		this.updateInfo();
	}

	@Input() set bgsPlayer(value: TwitchBgsPlayer) {
		if (this._previousPlayer === value) {
			return;
		}
		this._previousPlayer = value;
		this.updateInfo();
	}

	private updateInfo() {
		if (!this._previousPlayer) {
			return;
		}
		this._bgsPlayer = {
			player: BgsPlayer.create({
				cardId: this._previousPlayer.cardId,
				heroPowerCardId: this._previousPlayer.heroPowerCardId,
				initialHealth: this._previousPlayer.initialHealth,
				damageTaken: this._previousPlayer.damageTaken,
				isMainPlayer: this._previousPlayer.isMainPlayer,
				name: this._previousPlayer.name,
				leaderboardPlace: this._previousPlayer.leaderboardPlace,
				tavernUpgradeHistory: this._previousPlayer.tavernUpgradeHistory,
				tripleHistory: this._previousPlayer.tripleHistory,
				boardHistory: this.buildBoardHistory(this._previousPlayer.lastBoard),
			} as BgsPlayer),
			currentTurn: this._currentTurn,
		};
	}

	private buildBoardHistory(lastBoard: TwitchBgsBoard): readonly BgsBoard[] {
		if (!lastBoard) {
			return [];
		}
		return [
			{
				turn: lastBoard.turn,
				board: lastBoard.board.map(
					entity =>
						({
							id: entity.id,
							cardID: entity.cardID,
							tags: fromJS(entity.tags),
						} as Entity),
				),
			} as BgsBoard,
		];
	}
}
