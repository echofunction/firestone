import { Component, Input, ChangeDetectionStrategy, HostListener, ElementRef } from '@angular/core';

import { Set } from '../../models/set';

@Component({
	selector: 'sets-container',
	styleUrls: [
		`../../../css/component/collection/sets-container.component.scss`,
		`../../../css/global/scrollbar.scss`,
	],
	template: `
		<div *ngIf="category" class="sets-container">
			<div class="category-container {{ category.toLowerCase() }}">
				<ol>
					<li *ngFor="let set of _sets; trackBy: trackById">
						<set-view [cardSet]="set"></set-view>
					</li>
				</ol>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetsContainer {
	@Input() _sets: Set[];
	@Input() category: string;

	constructor(private elRef: ElementRef) {}

	@Input() set sets(sets: Set[]) {
		// console.log('setting new sets', sets);
		this._sets = sets;
	}

	trackById(index, set: Set) {
		return set.id;
	}

	// Prevent the window from being dragged around if user scrolls with click
	@HostListener('mousedown', ['$event'])
	onHistoryClick(event: MouseEvent) {
		const rect = this.elRef.nativeElement.querySelector('.sets-container').getBoundingClientRect();
		const scrollbarWidth = 5;
		// console.log('mousedown on sets container', rect, event);
		if (event.offsetX >= rect.width - scrollbarWidth) {
			event.stopPropagation();
		}
	}
}
