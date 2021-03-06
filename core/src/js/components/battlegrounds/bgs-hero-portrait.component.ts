import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewRef } from '@angular/core';

@Component({
	selector: 'bgs-hero-portrait',
	styleUrls: [`../../../css/component/battlegrounds/bgs-hero-portrait.component.scss`],
	template: `
		<div class="hero-portrait">
			<img [src]="_icon" class="portrait" />
			<div class="health" [ngClass]="{ 'damaged': _health < _maxHealth }">
				<img src="https://static.zerotoheroes.com/hearthstone/asset/firestone/images/health.png" class="icon" />
				<div class="value">{{ _health }}</div>
			</div>
			<div class="rating" *ngIf="rating != null">
				<div class="value">{{ rating?.toLocaleString('en-US') }}</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsHeroPortraitComponent {
	_icon: string;
	_health: number;
	_maxHealth: number;

	@Input() rating: number;

	@Input() set icon(value: string) {
		if (value === this._icon) {
			return;
		}
		this._icon = value;
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	@Input() set health(value: number) {
		if (value === this._health) {
			return;
		}
		this._health = Math.max(value, 0);
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	@Input() set maxHealth(value: number) {
		if (value === this._maxHealth) {
			return;
		}
		this._maxHealth = value;
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	constructor(private readonly cdr: ChangeDetectorRef) {
		cdr.detach();
	}
}
