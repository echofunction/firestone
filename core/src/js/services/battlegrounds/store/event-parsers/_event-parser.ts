import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { BattlegroundsEvent } from '../events/_battlegrounds-event';

export interface EventParser {
	applies(gameEvent: BattlegroundsEvent, state?: BattlegroundsState): boolean;
	parse(currentState: BattlegroundsState, gameEvent: BattlegroundsEvent): Promise<BattlegroundsState>;
	event(): string;
}
