import { ConnectedPosition, Overlay, OverlayPositionBuilder, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
	ChangeDetectorRef,
	ComponentRef,
	Directive,
	ElementRef,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	Optional,
	Renderer2,
	ViewRef,
} from '@angular/core';
import { HelpTooltipComponent } from '../components/tooltip/help-tooltip.component';
import { OverwolfService } from '../services/overwolf.service';

@Directive({
	selector: '[helpTooltip]',
})
// See https://blog.angularindepth.com/building-tooltips-for-angular-3cdaac16d138
export class HelpTooltipDirective implements OnInit, OnDestroy {
	_text = '';

	@Input('helpTooltipPosition') position: 'bottom' | 'right' | 'left' = 'bottom';

	@Input('helpTooltip') set text(value: string) {
		this._text = value;
		if (!this._text && this.overlayRef) {
			this.overlayRef?.detach();
		}
	}

	@Input() bindTooltipToGameWindow = false;

	private tooltipPortal: ComponentPortal<any>;
	private overlayRef: OverlayRef;
	private positionStrategy: PositionStrategy;

	constructor(
		private overlayPositionBuilder: OverlayPositionBuilder,
		private elementRef: ElementRef,
		private overlay: Overlay,
		private cdr: ChangeDetectorRef,
		@Optional() private ow: OverwolfService,
		private renderer: Renderer2,
	) {}

	ngOnInit() {
		const target = this.elementRef.nativeElement.querySelector('[helpTooltipTarget]') || this.elementRef;
		// console.log('targeting tooltip help element', this.position, target);

		const positionArrays: ConnectedPosition[] =
			this.position === 'bottom'
				? [
						{
							originX: 'center',
							originY: 'bottom',
							overlayX: 'center',
							overlayY: 'top',
						},
						{
							originX: 'start',
							originY: 'top',
							overlayX: 'start',
							overlayY: 'bottom',
						},
						{
							originX: 'start',
							originY: 'bottom',
							overlayX: 'start',
							overlayY: 'top',
						},
				  ]
				: this.position === 'right'
				? [
						{
							originX: 'end',
							originY: 'center',
							overlayX: 'start',
							overlayY: 'center',
						},
				  ]
				: [
						{
							originX: 'start',
							originY: 'center',
							overlayX: 'end',
							overlayY: 'center',
						},
				  ];
		this.positionStrategy = this.overlayPositionBuilder
			// Create position attached to the elementRef
			.flexibleConnectedTo(target)
			.withFlexibleDimensions(false)
			.withPush(false)
			.withViewportMargin(10)
			.withPositions(positionArrays);
		// Connect position strategy
		this.overlayRef = this.overlay.create({
			positionStrategy: this.positionStrategy,
			scrollStrategy: this.overlay.scrollStrategies.reposition(),
		});
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	ngOnDestroy() {
		if (this.overlayRef) {
			this.overlayRef?.detach();
			if (!(this.cdr as ViewRef)?.destroyed) {
				this.cdr.detectChanges();
			}
		}
	}

	@HostListener('mouseenter')
	async onMouseEnter() {
		if (!this._text) {
			return;
		}
		// Create tooltip portal
		this.tooltipPortal = new ComponentPortal(HelpTooltipComponent);

		// Attach tooltip portal to overlay
		const tooltipRef: ComponentRef<HelpTooltipComponent> = this.overlayRef.attach(this.tooltipPortal);

		// Pass content to tooltip component instance
		tooltipRef.instance.text = this._text;
		// console.log('setting tooltip text', this._text, tooltipRef);
		this.positionStrategy.apply();

		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}

		// These are used by the decktracker, since the window has some transparent space to the left
		// and right that can go out of the game's window
		// For all other cases, it should not be needed
		if (this.bindTooltipToGameWindow && this.ow) {
			const window = await this.ow.getCurrentWindow();
			const gameInfo = await this.ow.getRunningGameInfo();
			const tooltipLeft =
				window.left +
				(this.overlayRef.hostElement.getBoundingClientRect() as any).x +
				(tooltipRef.location.nativeElement.getBoundingClientRect() as any).x;
			if (tooltipLeft < 0) {
				console.log(
					'tooltip left',
					tooltipLeft,
					window,
					this.overlayRef.hostElement.getBoundingClientRect(),
					this.overlayRef.hostElement,
					tooltipRef,
					tooltipRef.location.nativeElement.getBoundingClientRect(),
					tooltipRef.location.nativeElement,
				);
				this.renderer.setStyle(tooltipRef.location.nativeElement, 'marginLeft', `${-tooltipLeft}px`);
			}

			const tooltipRight =
				window.left +
				(this.overlayRef.hostElement.getBoundingClientRect() as any).x +
				(tooltipRef.location.nativeElement.getBoundingClientRect() as any).x +
				(tooltipRef.location.nativeElement.getBoundingClientRect() as any).width;
			if (gameInfo && tooltipRight > gameInfo.logicalWidth) {
				console.log(
					'tooltip right',
					gameInfo,
					tooltipRight,
					window,
					this.overlayRef.hostElement.getBoundingClientRect(),
					this.overlayRef.hostElement,
					tooltipRef,
					tooltipRef.location.nativeElement.getBoundingClientRect(),
					tooltipRef.location.nativeElement,
				);
				this.renderer.setStyle(
					tooltipRef.location.nativeElement,
					'marginLeft',
					`${gameInfo.logicalWidth - tooltipRight}px`,
				);
			}
		}
	}

	@HostListener('mouseleave')
	onMouseLeave() {
		if (this.overlayRef) {
			this.overlayRef?.detach();
			if (!(this.cdr as ViewRef)?.destroyed) {
				this.cdr.detectChanges();
			}
		}
	}
}
