import { Component, HostListener, Input } from '@angular/core';

import { Set } from '../../models/set';
import { Events } from '../../services/events.service';

declare var overwolf: any;

@Component({
	selector: 'collection-menu',
	styleUrls: [
		`../../../css/global/menu.scss`,
		`../../../css/component/collection/collection-menu.component.scss`,
	],
	template: `
		<ng-container [ngSwitch]="displayType">
			<ul *ngSwitchCase="'menu'" class="menu-selection">
				<li class="selected" (click)="goToCollectionView()">Sets</li>
				<li>Cards</li>
			</ul>
			<ng-container *ngSwitchCase="'breadcrumbs'">
				<ul class="breadcrumbs" *ngIf="!searchString">
					<li (click)="goToCollectionView()">Sets</li>
					<li (click)="goToFormatView()">{{getSelectedFormat()}}</li>
					<li (click)="goToSetView()" *ngIf="selectedSet">{{selectedSet.name}}</li>
				</ul>
				<ul class="breadcrumbs" *ngIf="searchString" (click)="goToCollectionView()">
					<li>Home</li>
					<li>Search</li>
					<li>{{searchString}}</li>
				</ul>
			</ng-container>
		</ng-container>
	`,
})

export class CollectionMenuComponent {

	@Input() public displayType: string;
	@Input() public selectedSet: Set;
	@Input() public selectedFormat: string;
	@Input() public searchString: string;

	constructor(private _events: Events) {

	}

	private getSelectedFormat() {
		return this.selectedFormat.charAt(0).toUpperCase() + this.selectedFormat.slice(1);
	}

	private goToSetView() {
		this._events.broadcast(Events.SET_SELECTED, this.selectedSet);
	}

	private goToFormatView() {
		this._events.broadcast(Events.FORMAT_SELECTED, this.selectedSet.standard ? 'standard' : 'wild');
	}

	private goToCollectionView() {
		this._events.broadcast(Events.MODULE_SELECTED, 'collection');
	}
}
