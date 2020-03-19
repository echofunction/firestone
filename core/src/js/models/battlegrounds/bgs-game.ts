import { BgsPlayer } from './bgs-player';

export class BgsGame {
	readonly players: readonly BgsPlayer[] = [];
	readonly currentTurn: number = 1;

	public static create(base: BgsGame): BgsGame {
		return Object.assign(new BgsGame(), base);
	}

	public update(base: BgsGame) {
		return Object.assign(new BgsGame(), this, base);
	}

	public getMainPlayer(): BgsPlayer {
		return this.players.find(player => player.isMainPlayer);
	}
}
