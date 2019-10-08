import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ComponentFactoryResolver,
	ElementRef,
	HostBinding,
	Input,
	OnDestroy,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation,
	ViewRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Events } from '../services/events.service';

@Component({
	selector: 'tooltip',
	styleUrls: [`../../css/component/tooltip.component.scss`],
	encapsulation: ViewEncapsulation.None,
	template: `
		<div class="tooltip-container" [ngClass]="{ 'missing': missing }" *ngIf="cardId">
			<img
				src="/Files/assets/images/placeholder.png"
				class="pale-theme placeholder"
				[style.opacity]="showPlaceholder ? 1 : 0"
			/>
			<img
				src="{{ image() }}"
				(load)="imageLoadedHandler()"
				[style.opacity]="showPlaceholder ? 0 : 1"
				[ngClass]="{ 'removing': removing }"
			/>
			<div
				class="overlay"
				[ngStyle]="{ '-webkit-mask-image': overlayMaskImage() }"
				[hidden]="showPlaceholder"
			></div>
		</div>
	`,
	// I don't know how to make this work with OnPush
	// changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tooltip {
	@Input() cardId: string;
	@Input() missing: boolean;
	@Input() removing: boolean;

	@HostBinding('style.left') left: string;
	@HostBinding('style.top') top: string;
	@HostBinding('style.position') position: string;
	@HostBinding('style.display') display: string;

	showPlaceholder = true;

	constructor(private cdr: ChangeDetectorRef) {}

	image() {
		return `https://static.zerotoheroes.com/hearthstone/fullcard/en/compressed/${this.cardId}.png`;
	}
	overlayMaskImage() {
		return `url('https://static.zerotoheroes.com/hearthstone/fullcard/en/compressed/${this.cardId}.png')`;
	}
	imageLoadedHandler() {
		this.showPlaceholder = false;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}
}

@Component({
	selector: 'tooltips',
	styleUrls: [`../../css/component/tooltips.component.scss`],
	entryComponents: [Tooltip],
	encapsulation: ViewEncapsulation.None,
	template: `
		<div class="tooltips"><ng-template #tooltips></ng-template></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipsComponent implements AfterViewInit, OnDestroy {
	@Input() module: string;
	@Input() position = 'inside';

	@ViewChild('tooltips', { read: ViewContainerRef, static: false }) tooltips: ViewContainerRef;
	private tooltip;
	private showTooltipSubscription: Subscription;
	private hideTooltipSubscription: Subscription;

	constructor(
		private events: Events,
		private cdr: ChangeDetectorRef,
		private el: ElementRef,
		private resolver: ComponentFactoryResolver,
	) {
		this.showTooltipSubscription = this.events.on(Events.SHOW_TOOLTIP).subscribe(data => {
			// let start = Date.now();
			this.destroy();

			const cardId: string = data.data[0];
			let left: number = data.data[1];
			const elementTop: number = data.data[2];
			const owned: boolean = data.data[3];
			const elementRect = data.data[4];
			let top: number = Math.min(window.innerHeight - 400, elementTop - 388 / 2);
			// console.log('displaying tooltip', elementRect);

			if (this.position === 'outside') {
				top = elementRect.top - 275 / 2;
				const containerHeight = parseInt(window.getComputedStyle(this.el.nativeElement).height.split('px')[0]);
				// console.log('considering outside positioning', data, containerHeight, top);
				if (top < 0) {
					top = 0;
				} else if (top + 290 > containerHeight) {
					top = containerHeight - 290;
				}
				// else if (top > window.innerHeight - 400) {
				//     top = window.innerHeight - 400;
				// }
				if (elementRect.left < 350) {
					left = elementRect.right + 12;
				} else {
					left = elementRect.left - 217;
				}
			} else if (this.module === 'decktracker') {
				// console.log('displaying decktracker tooltip', top, elementRect);
				// If element is too high, display the tooltip below the mouse
				if (elementRect.top < 350) {
					top = elementTop + 15;
				} else {
					top = elementTop - 300;
				}
				left = 0;
			} else if (left > 500) {
				// Tooltip width and offset
				left = left - 256 - 70;
			}

			this.tooltip.instance.showPlaceholder = true;
			this.tooltip.instance.display = 'flex';
			this.tooltip.instance.removing = false;
			this.tooltip.instance.cardId = cardId;
			this.tooltip.instance.left = left + 'px';
			this.tooltip.instance.top = top + 'px';
			this.tooltip.instance.position = 'absolute';
			this.tooltip.instance.missing = !owned;
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
			// console.log('Created tooltip after', (Date.now() - start));
		});

		this.hideTooltipSubscription = this.events.on(Events.HIDE_TOOLTIP).subscribe(data => {
			// console.log('hiding tooltip', data);
			this.destroy();
		});
	}

	ngAfterViewInit() {
		this.cdr.detach();
		// https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4
		setTimeout(() => {
			// We create a factory out of the component we want to create
			const factory = this.resolver.resolveComponentFactory(Tooltip);

			// We create the component using the factory and the injector
			this.tooltip = this.tooltips.createComponent(factory);
		});
	}

	ngOnDestroy() {
		this.showTooltipSubscription.unsubscribe();
		this.hideTooltipSubscription.unsubscribe();
	}

	private destroy() {
		if (this.tooltip && this.tooltip.instance) {
			this.tooltip.instance.removing = true;
			this.tooltip.instance.display = 'none';
		}
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}
}
