import { HttpClient } from '@angular/common/http';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	ViewRef,
} from '@angular/core';
import { inflate } from 'pako';
import { Subscription } from 'rxjs';
import { GameState } from '../../../../models/decktracker/game-state';
import { DeckEvents } from '../../../../services/decktracker/event-parser/deck-events';
import { Events } from '../../../../services/events.service';
import fakeState from './gameState.json';

const EBS_URL = 'https://ebs.firestoneapp.com/deck';
// const EBS_URL = 'https://localhost:8081/deck';

@Component({
	selector: 'decktracker-overlay-container',
	styleUrls: [
		'../../../../../css/global/components-global.scss',
		'../../../../../css/component/decktracker/overlay/twitch/decktracker-overlay-container.component.scss',
		// '../../../../../css/component/decktracker/overlay/twitch/decktracker-overlay-container-dev.component.scss',
	],
	template: `
		<div class="container drag-boundary">
			<state-mouse-over [gameState]="gameState" *ngIf="gameState"></state-mouse-over>
			<decktracker-overlay-standalone [gameState]="gameState" (dragStart)="onDragStart()" (dragEnd)="onDragEnd()">
			</decktracker-overlay-standalone>
			<tooltips [module]="'decktracker'" [position]="'outside'"></tooltips>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckTrackerOverlayContainerComponent implements AfterViewInit, OnDestroy {
	gameState: GameState;
	activeTooltip: string;

	private showTooltipTimer;
	private hideTooltipTimer;

	private twitch;
	private token: string;

	private dragging = false;
	private showTooltipSubscription: Subscription;
	private hideTooltipSubscription: Subscription;

	constructor(private cdr: ChangeDetectorRef, private events: Events, private http: HttpClient) {
		this.showTooltipSubscription = this.events.on(Events.DECK_SHOW_TOOLTIP).subscribe(data => {
			clearTimeout(this.hideTooltipTimer);
			if (this.dragging) {
				return;
			}
			// Already in tooltip mode
			if (this.activeTooltip) {
				this.activeTooltip = data.data[0];
				this.events.broadcast(Events.SHOW_TOOLTIP, ...data.data);
				if (!(this.cdr as ViewRef).destroyed) {
					this.cdr.detectChanges();
				}
			} else {
				this.showTooltipTimer = setTimeout(() => {
					this.activeTooltip = data.data[0];
					this.events.broadcast(Events.SHOW_TOOLTIP, ...data.data);
					if (!(this.cdr as ViewRef).destroyed) {
						this.cdr.detectChanges();
					}
				}, 300);
			}
		});
		this.hideTooltipSubscription = this.events.on(Events.DECK_HIDE_TOOLTIP).subscribe(data => {
			clearTimeout(this.showTooltipTimer);
			this.hideTooltipTimer = setTimeout(() => {
				this.activeTooltip = undefined;
				this.events.broadcast(Events.HIDE_TOOLTIP, ...data.data);
				if (!(this.cdr as ViewRef).destroyed) {
					this.cdr.detectChanges();
				}
			}, 200);
		});
		console.log('hop hop hop hop hop');
	}

	ngAfterViewInit() {
		this.cdr.detach();
		if (!(window as any).Twitch) {
			setTimeout(() => this.ngAfterViewInit(), 500);
			return;
		}
		this.twitch = (window as any).Twitch.ext;
		// this.twitch.onContext((context, contextfields) => console.log('oncontext', context, contextfields));
		this.twitch.onAuthorized(auth => {
			console.log('on authorized', auth);
			this.token = auth.token;
			console.log('set token', this.token);
			this.fetchInitialState();
			this.twitch.listen('broadcast', (target, contentType, event) => {
				const deckEvent = JSON.parse(inflate(event, { to: 'string' }));
				console.log('received event', deckEvent);
				this.processEvent(deckEvent);
			});
		});
		console.log('init done');
		// this.addDebugGameState();
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	ngOnDestroy(): void {
		this.showTooltipSubscription.unsubscribe();
		this.hideTooltipSubscription.unsubscribe();
	}

	onDragStart() {
		this.dragging = true;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	onDragEnd() {
		this.dragging = false;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private fetchInitialState() {
		console.log('retrieving initial state');
		const options = {
			headers: { 'Authorization': 'Bearer ' + this.token },
		};
		this.http.get(EBS_URL, options).subscribe((result: any) => {
			console.log('successfully retrieved initial state', result);
			if (result.event === DeckEvents.GAME_END) {
				this.gameState = undefined;
			} else {
				this.gameState = result.state;
			}
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		});
	}

	private async processEvent(event) {
		switch (event.event.name) {
			case DeckEvents.GAME_END:
				console.log('received GAME_END event');
				this.gameState = undefined;
				if (!(this.cdr as ViewRef).destroyed) {
					this.cdr.detectChanges();
				}
				break;
			default:
				console.log('received deck event');
				this.gameState = event.state;
				if (!(this.cdr as ViewRef).destroyed) {
					this.cdr.detectChanges();
				}
				break;
		}
	}

	private addDebugGameState() {
		this.gameState = fakeState as any;
		console.log('loaded fake state', this.gameState);
	}
}