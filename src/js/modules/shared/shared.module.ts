import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { InlineSVGModule } from 'ng-inline-svg';
import { SelectModule } from 'ng-select';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AdsComponent } from '../../components/ads.component';
import { CdkOverlayContainer } from '../../components/cdk-overlay-container.component';
import { ControlBugComponent } from '../../components/controls/control-bug.component';
import { ControlCloseComponent } from '../../components/controls/control-close.component';
import { ControlDiscordComponent } from '../../components/controls/control-discord.component';
import { ControlHelpComponent } from '../../components/controls/control-help.component';
import { ControlMaximizeComponent } from '../../components/controls/control-maximize.component';
import { ControlMinimizeComponent } from '../../components/controls/control-minimize.component';
import { ControlSettingsComponent } from '../../components/controls/control-settings.component';
import { FilterComponent } from '../../components/filter.component';
import { HotkeyComponent } from '../../components/hotkey.component';
import { LoadingStateComponent } from '../../components/loading-state.component';
import { PreferenceToggleComponent } from '../../components/settings/preference-toggle.component';
import { CardTooltipComponent } from '../../components/tooltip/card-tooltip.component';
import { ConfirmationComponent } from '../../components/tooltip/confirmation.component';
import { HelpTooltipComponent } from '../../components/tooltip/help-tooltip.component';
import { Tooltip, TooltipsComponent } from '../../components/tooltips.component';
import { VersionComponent } from '../../components/version.component';
import { WindowWrapperComponent } from '../../components/window-wrapper.component';
import { WithLoadingComponent } from '../../components/with-loading.component';
import { ActiveThemeDirective } from '../../directives/active-theme.directive';
import { AskConfirmationDirective } from '../../directives/ask-confirmation.directive';
import { CardTooltipDirective } from '../../directives/card-tooltip.directive';
import { ComponentTooltipDirective } from '../../directives/component-tooltip.directive';
import { HelpTooltipDirective } from '../../directives/help-tooltip.directive';
import { PulseDirective } from '../../directives/pulse.directive';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@NgModule({
	imports: [
		CommonModule,
		BrowserModule,
		OverlayModule,
		SelectModule,
		FormsModule,
		ReactiveFormsModule,
		NgScrollbarModule,
		ScrollingModule,
		InlineSVGModule.forRoot(),
	],
	declarations: [
		WindowWrapperComponent,

		ControlHelpComponent,
		ControlMinimizeComponent,
		ControlMaximizeComponent,
		ControlCloseComponent,
		ControlSettingsComponent,
		ControlDiscordComponent,
		ControlBugComponent,

		HotkeyComponent,
		VersionComponent,

		Tooltip,
		TooltipsComponent,
		CardTooltipComponent,
		HelpTooltipComponent,
		ConfirmationComponent,

		CardTooltipDirective,
		ComponentTooltipDirective,
		HelpTooltipDirective,
		ActiveThemeDirective,
		PulseDirective,
		AskConfirmationDirective,

		LoadingStateComponent,
		WithLoadingComponent,

		PreferenceToggleComponent,

		FilterComponent,
		SafeHtmlPipe,

		AdsComponent,
	],
	entryComponents: [Tooltip, HelpTooltipComponent, CardTooltipComponent, ConfirmationComponent],
	exports: [
		WindowWrapperComponent,

		ControlHelpComponent,
		ControlMinimizeComponent,
		ControlMaximizeComponent,
		ControlCloseComponent,
		ControlSettingsComponent,
		ControlDiscordComponent,
		ControlBugComponent,

		HotkeyComponent,
		VersionComponent,

		Tooltip,
		TooltipsComponent,
		CardTooltipComponent,
		HelpTooltipComponent,
		ConfirmationComponent,

		ComponentTooltipDirective,
		CardTooltipDirective,
		HelpTooltipDirective,
		ActiveThemeDirective,
		PulseDirective,
		AskConfirmationDirective,

		LoadingStateComponent,
		WithLoadingComponent,

		PreferenceToggleComponent,

		FilterComponent,
		SafeHtmlPipe,

		AdsComponent,
	],
	providers: [{ provide: OverlayContainer, useClass: CdkOverlayContainer }],
})
export class SharedModule {}
