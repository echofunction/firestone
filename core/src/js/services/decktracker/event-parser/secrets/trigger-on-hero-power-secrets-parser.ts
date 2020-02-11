import { CardIds } from '@firestone-hs/reference-data';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { BoardSecret } from '../../../../models/decktracker/board-secret';
import { DeckState } from '../../../../models/decktracker/deck-state';
import { GameState } from '../../../../models/decktracker/game-state';
import { GameEvent } from '../../../../models/game-event';
import { DeckManipulationHelper } from '../deck-manipulation-helper';
import { EventParser } from '../event-parser';

export class TriggerOnHeroPowerSecretsParser implements EventParser {
	private secretsTriggeringOnAttack = [CardIds.Collectible.Hunter.DartTrap];

	constructor(private readonly helper: DeckManipulationHelper, private readonly allCards: AllCardsService) {}

	applies(gameEvent: GameEvent, state: GameState): boolean {
		return state && gameEvent.type === GameEvent.HERO_POWER_USED;
	}

	async parse(currentState: GameState, gameEvent: GameEvent): Promise<GameState> {
		const userControllerId = gameEvent.controllerId;
		const isPlayerTheOneWhoUsedTheHeroPower = userControllerId === gameEvent.localPlayer.PlayerId;
		const deckWithSecretToCheck = isPlayerTheOneWhoUsedTheHeroPower
			? currentState.opponentDeck
			: currentState.playerDeck;

		const toExclude = [];
		const optionsToFlagAsInvalid = this.secretsTriggeringOnAttack.filter(
			secret => toExclude.indexOf(secret) === -1,
		);
		let secrets: BoardSecret[] = [...deckWithSecretToCheck.secrets];
		for (const secret of optionsToFlagAsInvalid) {
			// console.log('marking as invalid', secret, secrets);
			secrets = [...this.helper.removeSecretOptionFromSecrets(secrets, secret)];
			// console.log('marked as invalid', secret, newPlayerDeck);
		}
		let newPlayerDeck = deckWithSecretToCheck.update({
			secrets: secrets as readonly BoardSecret[],
		} as DeckState);
		return Object.assign(new GameState(), currentState, {
			[isPlayerTheOneWhoUsedTheHeroPower ? 'opponentDeck' : 'playerDeck']: newPlayerDeck,
		});
	}

	event(): string {
		return 'SECRET_HERO_POWER';
	}
}