import { BoardEntity } from '../board-entity';

export class BgsBoard {
	readonly turn: number;
	readonly board: readonly BoardEntity[] = [];

	public static create(base: BgsBoard): BgsBoard {
		return Object.assign(new BgsBoard(), base);
	}
}
