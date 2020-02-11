import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'with-loading',
	styleUrls: [`../../css/global/components-global.scss`, `../../css/component/with-loading.component.scss`],
	template: `
		<ng-container class="with-loading">
			<div class="content" *ngIf="!isLoading" [@fadeInOut]>
				<ng-content></ng-content>
			</div>
			<loading-state *ngIf="isLoading" [@fadeInOut]></loading-state>
		</ng-container>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('fadeInOut', [
			state(
				'void',
				style({
					opacity: 0,
				}),
			),
			transition('void <=> *', animate(300)),
		]),
	],
})
export class WithLoadingComponent {
	@Input() isLoading: boolean;
}