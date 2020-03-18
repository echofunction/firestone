export class BgsTriple {
	readonly turn: number;
	readonly tierOfTripledMinion: number;

	public static create(base: BgsTriple): BgsTriple {
		return Object.assign(new BgsTriple(), base);
	}
}
