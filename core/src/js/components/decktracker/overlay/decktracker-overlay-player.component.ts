import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameState } from '../../../models/decktracker/game-state';
import { Preferences } from '../../../models/preferences';
import { PreferencesService } from '../../../services/preferences.service';

@Component({
	selector: 'decktracker-overlay-player',
	styleUrls: [],
	template: `
		<decktracker-overlay-root
			[overlayWidthExtractor]="overlayWidthExtractor"
			[overlayDisplayModeExtractor]="overlayDisplayModeExtractor"
			[opacityExtractor]="opacityExtractor"
			[scaleExtractor]="scaleExtractor"
			[cardsGoToBottomExtractor]="cardsGoToBottomExtractor"
			[darkenUsedCardsExtractor]="darkenUsedCardsExtractor"
			[hideGeneratedCardsInOtherZoneExtractor]="hideGeneratedCardsInOtherZoneExtractor"
			[sortCardsByManaCostInOtherZoneExtractor]="sortCardsByManaCostInOtherZoneExtractor"
			[deckExtractor]="deckExtractor"
			[trackerPositionUpdater]="trackerPositionUpdater"
			[trackerPositionExtractor]="trackerPositionExtractor"
			[showDeckWinrateExtractor]="showDeckWinrateExtractor"
			[showMatchupWinrateExtractor]="showMatchupWinrateExtractor"
			[defaultTrackerPositionLeftProvider]="defaultTrackerPositionLeftProvider"
			[defaultTrackerPositionTopProvider]="defaultTrackerPositionTopProvider"
			closeEvent="CLOSE_TRACKER"
			player="player"
		>
		</decktracker-overlay-root>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckTrackerOverlayPlayerComponent {
	overlayWidthExtractor = (prefs: Preferences) => prefs.overlayWidthInPx;
	overlayDisplayModeExtractor = (prefs: Preferences) =>
		!prefs.overlayGroupByZone ? 'DISPLAY_MODE_GROUPED' : 'DISPLAY_MODE_ZONE';
	opacityExtractor = (prefs: Preferences) => prefs.overlayOpacityInPercent;
	scaleExtractor = (prefs: Preferences) => prefs.decktrackerScale;
	cardsGoToBottomExtractor = (prefs: Preferences) => prefs.overlayCardsGoToBottom;
	darkenUsedCardsExtractor = (prefs: Preferences) => true;
	hideGeneratedCardsInOtherZoneExtractor = (prefs: Preferences) => prefs.overlayHideGeneratedCardsInOtherZone;
	sortCardsByManaCostInOtherZoneExtractor = (prefs: Preferences) => prefs.overlaySortByManaInOtherZone;
	deckExtractor = (state: GameState) => state.playerDeck;
	trackerPositionUpdater = (left: number, top: number) => this.prefs.updateTrackerPosition(left, top);
	trackerPositionExtractor = (prefs: Preferences) => prefs.decktrackerPosition;
	showDeckWinrateExtractor = (prefs: Preferences) => prefs.overlayShowDeckWinrate;
	showMatchupWinrateExtractor = (prefs: Preferences) => prefs.overlayShowMatchupWinrate;
	defaultTrackerPositionLeftProvider = (gameWidth: number, width: number, dpi: number) =>
		gameWidth - width * dpi - 40;
	defaultTrackerPositionTopProvider = (gameWidth: number, width: number, dpi: number) => 10;

	constructor(private prefs: PreferencesService) {}
}
