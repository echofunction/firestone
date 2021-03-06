import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColiseumComponentsModule } from '@firestone-hs/coliseum-components';
import { init, Integrations } from '@sentry/browser';
import { CaptureConsole, ExtraErrorData } from '@sentry/integrations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { InlineSVGModule } from 'ng-inline-svg';
import { SelectModule } from 'ng-select';
import { ChartsModule } from 'ng2-charts';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { BattlegroundsContentComponent } from '../../components/battlegrounds/battlegrounds-content.component';
import { BattlegroundsComponent } from '../../components/battlegrounds/battlegrounds.component';
import { BgsCardTooltipComponent } from '../../components/battlegrounds/bgs-card-tooltip.component';
import { BgsHeroMiniComponent } from '../../components/battlegrounds/hero-selection/bgs-hero-mini.component';
import { BgsHeroOverviewComponent } from '../../components/battlegrounds/hero-selection/bgs-hero-overview.component';
import { BgsHeroSelectionOverviewComponent } from '../../components/battlegrounds/hero-selection/bgs-hero-selection-overview.component';
import { BgsHeroSelectionTooltipComponent } from '../../components/battlegrounds/hero-selection/bgs-hero-selection-tooltip.component';
import { BgsHeroStatsComponent } from '../../components/battlegrounds/hero-selection/bgs-hero-stats.component';
import { BgsHeroTierComponent } from '../../components/battlegrounds/hero-selection/bgs-hero-tier.component.ts';
import { BgsHeroTribesComponent } from '../../components/battlegrounds/hero-selection/bgs-hero-tribes.component';
import { BgsHeroWarbandStatsComponent } from '../../components/battlegrounds/hero-selection/bgs-hero-warband-stats.component';
import { BgsHeroFaceOffComponent } from '../../components/battlegrounds/in-game/bgs-hero-face-off.component';
import { BgsHeroFaceOffsComponent } from '../../components/battlegrounds/in-game/bgs-hero-face-offs.component';
import { BgsNextOpponentOverviewComponent } from '../../components/battlegrounds/in-game/bgs-next-opponent-overview.component';
import { BgsOpponentOverviewComponent } from '../../components/battlegrounds/in-game/bgs-opponent-overview.component';
import { MenuSelectionBgsComponent } from '../../components/battlegrounds/menu-selection-bgs.component';
import { BgsChartHpComponent } from '../../components/battlegrounds/post-match/bgs-chart-hp.component';
import { BgsChartWarbandCompositionComponent } from '../../components/battlegrounds/post-match/bgs-chart-warband-composition.component';
import { BgsChartWarbandStatsComponent } from '../../components/battlegrounds/post-match/bgs-chart-warband-stats.component';
import { BgsPostMatchStatsRecapComponent } from '../../components/battlegrounds/post-match/bgs-post-match-stats-recap.component';
import { BgsPostMatchStatsComponent } from '../../components/battlegrounds/post-match/bgs-post-match-stats.component';
import { StatCellComponent } from '../../components/battlegrounds/post-match/stat-cell.component';
import { AdService } from '../../services/ad.service';
import { BgsBattleSimulationService } from '../../services/battlegrounds/bgs-battle-simulation.service';
import { SharedServicesModule } from '../shared-services/shared-services.module';
import { SharedModule } from '../shared/shared.module';

init({
	dsn: 'https://53b0813bb66246ae90c60442d05efefe@o92856.ingest.sentry.io/1338840',
	enabled: process.env.NODE_ENV === 'production',
	release: process.env.APP_VERSION,
	attachStacktrace: true,
	sampleRate: 0.1,
	integrations: [
		new Integrations.GlobalHandlers({
			onerror: true,
			onunhandledrejection: true,
		}),
		new ExtraErrorData(),
		new CaptureConsole({
			levels: ['error'],
		}),
	],
});

console.log('version is ' + process.env.APP_VERSION);

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule,
		BrowserAnimationsModule,
		SharedModule,
		SelectModule,
		OverlayModule,
		FormsModule,
		ReactiveFormsModule,
		LoggerModule.forRoot({ level: NgxLoggerLevel.WARN }),
		ChartsModule,
		NgxChartsModule,
		SharedServicesModule.forRoot(),
		ColiseumComponentsModule,
		InlineSVGModule.forRoot(),
	],
	declarations: [
		BattlegroundsComponent,
		BattlegroundsContentComponent,
		BgsHeroSelectionOverviewComponent,
		BgsHeroOverviewComponent,
		BgsHeroWarbandStatsComponent,
		BgsNextOpponentOverviewComponent,
		BgsPostMatchStatsComponent,
		BgsPostMatchStatsRecapComponent,
		StatCellComponent,
		BgsHeroMiniComponent,
		BgsHeroFaceOffComponent,
		BgsOpponentOverviewComponent,
		BgsChartHpComponent,
		BgsChartWarbandStatsComponent,
		BgsChartWarbandCompositionComponent,
		MenuSelectionBgsComponent,
		BgsHeroTierComponent,
		BgsHeroSelectionTooltipComponent,
		BgsHeroStatsComponent,
		BgsHeroTribesComponent,
		// BgsOpponentOverviewBigComponent,
		BgsHeroFaceOffsComponent,
		// BgsBoardComponent,
		// BgsCardTooltipComponent,
		// BgsHeroPortraitComponent,
		// BgsBattleStatusComponent,
		// BgsTriplesComponent,
		// MinionIconComponent,
	],
	entryComponents: [BgsHeroSelectionTooltipComponent, BgsCardTooltipComponent],
	bootstrap: [BattlegroundsComponent],
	providers: [AdService, BgsBattleSimulationService],
})
export class BattlegroundsModule {}
