import { ReplayInfo } from './replay-info';

export class Achievement {
	readonly id: string;
	readonly type: string;
	readonly name: string;
	readonly displayName: string;
	readonly text: string;
	readonly displayCardId: string;
	readonly displayCardType: string;
	readonly difficulty: string;
	readonly points: number;
	readonly numberOfCompletions: number = 0;
	readonly replayInfo: readonly ReplayInfo[] = [];
}
