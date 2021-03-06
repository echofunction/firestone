import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	ViewRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';
import { ThumbnailInfo } from '../../models/achievement/thumbnail-info';
import { SocialShareUserInfo } from '../../models/mainwindow/social-share-user-info';
import { ReplayInfo } from '../../models/replay-info';
import { VisualAchievement } from '../../models/visual-achievement';
import { VideoReplayDeletionRequestEvent } from '../../services/mainwindow/store/events/achievements/video-replay-deletion-request-event';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';
import { OverwolfService } from '../../services/overwolf.service';
import { PreferencesService } from '../../services/preferences.service';

declare let amplitude;

@Component({
	selector: 'achievement-recordings',
	styleUrls: [`../../../css/component/achievements/achievement-recordings.component.scss`],
	template: `
		<div class="achievement-recordings" *ngIf="currentThumbnail">
			<vg-player [ngClass]="{ 'deleted': currentThumbnail.isDeleted }" (onPlayerReady)="onPlayerReady($event)">
				<div class="title" [innerHTML]="title"></div>
				<fs-overlay-play></fs-overlay-play>

				<vg-controls>
					<vg-play-pause></vg-play-pause>
					<fs-time-display vgProperty="current" vgFormat="mm:ss"></fs-time-display>
					<fs-time-display vgProperty="total" vgFormat="mm:ss"></fs-time-display>

					<vg-scrub-bar [vgSlider]="true">
						<vg-scrub-bar-current-time [vgSlider]="true"></vg-scrub-bar-current-time>
					</vg-scrub-bar>

					<vg-mute></vg-mute>
					<vg-volume></vg-volume>

					<i class="video-folder" (mousedown)="openVideoFolder()">
						<svg>
							<use xlink:href="/Files/assets/svg/sprite.svg#video_folder" />
						</svg>
					</i>

					<!-- Going out of full sceren causes issues I don't know how to fix quickly. 
					Since the video recordings are not widely used, I'll just disable full screen for now -->
					<!-- <vg-fullscreen [ngClass]="{ 'fullscreen': fullscreen }"></vg-fullscreen> -->
				</vg-controls>

				<achievement-social-shares
					*ngIf="!currentThumbnail.isDeleted"
					[socialShareUserInfo]="socialShareUserInfo"
					[achievementName]="_achievement.name"
					[title]="title"
					[videoPathOnDisk]="currentVideoPathOnDisk"
					[videoPath]="currentReplayLocation"
				>
				</achievement-social-shares>

				<video [vgMedia]="media" #media id="singleVideo" preload="auto">
					<source [src]="currentReplay" type="video/mp4" />
				</video>
			</vg-player>
			<div class="no-media" *ngIf="currentThumbnail.isDeleted">
				<i>
					<svg>
						<use xlink:href="/Files/assets/svg/sprite.svg#no_media" />
					</svg>
				</i>
				<span>Media deleted</span>
			</div>

			<div class="thumbnails">
				<i
					class="page-arrow previous-page"
					[ngClass]="{ 'disabled': indexOfFirstShown === 0 }"
					(mousedown)="goToPreviousPage()"
					*ngIf="thumbnails.length > THUMBNAILS_PER_PAGE"
				>
					<svg>
						<use xlink:href="/Files/assets/svg/sprite.svg#carousel_arrow" />
					</svg>
				</i>
				<ul>
					<div class="offset" [style.marginLeft.px]="thumbnailsOffsetX"></div>
					<achievement-thumbnail
						*ngFor="let thumbnail of thumbnails"
						[ngClass]="{ 'inDeletion': thumbnail.inDeletion }"
						(mousedown)="showReplay(thumbnail, $event)"
						(deletionRequest)="onDeletionRequest(thumbnail, $event)"
						[highlighted]="pendingDeletion === thumbnail"
						[thumbnail]="thumbnail"
						[currentThumbnail]="currentThumbnail"
					>
					</achievement-thumbnail>
				</ul>
				<i
					class="page-arrow next-page"
					[ngClass]="{ 'disabled': indexOfFirstShown === thumbnails.length - THUMBNAILS_PER_PAGE }"
					(mousedown)="goToNextPage()"
					*ngIf="thumbnails.length > THUMBNAILS_PER_PAGE"
				>
					<svg>
						<use xlink:href="/Files/assets/svg/sprite.svg#carousel_arrow" />
					</svg>
				</i>
			</div>
			<div
				class="zth-tooltip confirmation-popup right"
				*ngIf="showConfirmationPopup"
				[style.top.px]="confirmationTop"
				[style.left.px]="confirmationLeft"
			>
				<p>Are you sure?</p>
				<div class="buttons">
					<button (mousedown)="hideConfirmationPopup($event)" class="cancel"><span>Cancel</span></button>
					<button (mousedown)="deleteMedia(pendingDeletion)" class="confirm"><span>Delete</span></button>
				</div>
				<div class="dont-ask" (mousedown)="toggleDontAsk($event)">
					<input hidden type="checkbox" name="" id="a-01" />
					<label for="a-01">
						<i class="unchecked" *ngIf="!dontAsk">
							<svg>
								<use xlink:href="/Files/assets/svg/sprite.svg#unchecked_box" />
							</svg>
						</i>
						<i class="checked" *ngIf="dontAsk">
							<svg>
								<use xlink:href="/Files/assets/svg/sprite.svg#checked_box" />
							</svg>
						</i>
						<p>Don't ask me again</p>
					</label>
				</div>
				<svg class="tooltip-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9">
					<polygon points="0,0 8,-9 16,0" />
				</svg>
			</div>
			<div class="delete-notification" [ngClass]="{ 'hidden': !showDeleteNotification }">
				Replay deleted
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementRecordingsComponent implements AfterViewInit, OnDestroy {
	readonly THUMBNAILS_PER_PAGE = 5;

	@Input() socialShareUserInfo: SocialShareUserInfo;
	_achievement: VisualAchievement;

	thumbnails: ThumbnailInfo[] = [];

	currentThumbnail: ThumbnailInfo;
	currentReplayLocation: string;
	currentVideoPathOnDisk: string;
	currentReplay: SafeUrl;
	title: SafeHtml;
	fullscreen = false;
	indexOfFirstShown = 0;
	thumbnailsOffsetX = 0;
	thumbnailWidth = 102; // TODO: retrieve this from actual size

	pendingDeletion: ThumbnailInfo;
	showConfirmationPopup: boolean;
	dontAsk = false;
	confirmationTop = 0;
	confirmationLeft = 0;
	showDeleteNotification: boolean;

	private player;
	private stateUpdater: EventEmitter<MainWindowStoreEvent>;
	private stateChangedListener: (message: any) => void;
	private api: VgAPI;
	private fsAPI: VgFullscreenAPI;

	constructor(
		private elRef: ElementRef,
		private cdr: ChangeDetectorRef,
		private prefs: PreferencesService,
		private ow: OverwolfService,
		private sanitizer: DomSanitizer,
	) {}

	@Input() set achievement(achievement: VisualAchievement) {
		this._achievement = achievement;
		this.update();
	}

	private update() {
		// console.log('[achievement-recordings] setting achievement', achievement);
		setTimeout(async () => {
			await this.updateThumbnails(this._achievement.replayInfo);
			if (this.player) {
				this.player.load();
			}
			// this.player.play();
			if (this.api) {
				this.api.currentTime = 0;
				// this.api.play();
				this.api.getDefaultMedia().currentTime = 0;
			}
			// this.api.getDefaultMedia().play();
			if (!(this.cdr as ViewRef)?.destroyed) {
				this.cdr.detectChanges();
			}
		});
	}

	async ngAfterViewInit() {
		// console.log('[achievement-recordings] init');
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
		this.player = this.elRef.nativeElement.querySelector('video');
		if (!this.player) {
			setTimeout(() => this.ngAfterViewInit(), 50);
			return;
		}
		// auto pause the video when window is closed / minimized
		const prefs = await this.prefs.getPreferences();
		const windowName = await this.ow.getCollectionWindowName(prefs);
		this.stateChangedListener = this.ow.addStateChangedListener(windowName, message => {
			if (message.window_state !== 'normal') {
				this.player.pause();
			}
		});
	}

	ngOnDestroy(): void {
		this.ow.removeStateChangedListener(this.stateChangedListener);
	}

	onPlayerReady(api: VgAPI) {
		// console.log('[achievement-recordings] on player ready');
		this.api = api;
		// this.fsAPI = this.api.fsAPI;
		// this.nativeFs = this.fsAPI.nativeFullscreen;

		this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
			// Set the video to the beginning
			// console.log('[achievement-recordings] reset current time');
			this.api.getDefaultMedia().currentTime = 0;
		});

		// this.fsAPI.onChangeFullscreen.subscribe(event => {
		// 	amplitude.getInstance().logEvent('achievement-video', {
		// 		'action': 'full-screen',
		// 	});
		// 	console.log('[achievement-recordings] full screen change', event);
		// 	this.fullscreen = !this.fullscreen;
		// 	if (!(this.cdr as ViewRef)?.destroyed) {
		// 		this.cdr.detectChanges();
		// 	}
		// });
	}

	showReplay(thumbnail: ThumbnailInfo, event: MouseEvent) {
		amplitude.getInstance().logEvent('achievement-video', {
			'action': 'play',
		});
		// console.log('[achievment-recordings] showing rplay', thumbnail);
		event.stopPropagation();
		if (this.currentThumbnail === thumbnail) {
			return;
		}
		this.updateThumbnail(thumbnail);
		this.player.load();
		// this.player.play();
		this.api.currentTime = 0;
		// this.api.play();
		this.api.getDefaultMedia().currentTime = 0;
		// this.api.getDefaultMedia().play();
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	async openVideoFolder() {
		amplitude.getInstance().logEvent('achievement-video', {
			'action': 'open-folder',
		});
		await this.ow.openWindowsExplorer(this.currentReplayLocation);
		// console.log('opened', result);
	}

	goToPreviousPage() {
		amplitude.getInstance().logEvent('achievement-video', {
			'action': 'previous-page',
		});
		this.indexOfFirstShown = Math.max(0, this.indexOfFirstShown - this.THUMBNAILS_PER_PAGE);
		this.thumbnailsOffsetX = -this.indexOfFirstShown * this.thumbnailWidth;
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	goToNextPage() {
		amplitude.getInstance().logEvent('achievement-video', {
			'action': 'next-page',
		});
		this.indexOfFirstShown = Math.min(
			this.indexOfFirstShown + this.THUMBNAILS_PER_PAGE,
			this.thumbnails.length - this.THUMBNAILS_PER_PAGE,
		);
		this.thumbnailsOffsetX = -this.indexOfFirstShown * this.thumbnailWidth;
		// console.log('thumnailOffset', this.thumbnailsOffsetX);
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	async onDeletionRequest(thumbnail: ThumbnailInfo, event) {
		amplitude.getInstance().logEvent('achievement-video', {
			'action': 'request-delete',
		});
		console.log('on deletionRequest', thumbnail, event);
		this.dontAsk = (await this.prefs.getPreferences()).dontConfirmVideoReplayDeletion;
		if (this.dontAsk) {
			await this.deleteMedia(thumbnail);
		} else {
			this.showConfirmationPopup = true;
			this.pendingDeletion = thumbnail;
			const container = this.elRef.nativeElement.querySelector('.achievement-recordings').getBoundingClientRect();
			this.confirmationTop = event.top - container.top + 55;
			this.confirmationLeft = event.left - container.left + 130;
		}
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	async deleteMedia(thumbnail: ThumbnailInfo) {
		console.log('deleting media', thumbnail);
		// All this is not really clean, we should probably have the state drive ALL of the UI interactions,
		// and just have the views reflect the state of the store
		this.stateUpdater.next(new VideoReplayDeletionRequestEvent(thumbnail.stepId, thumbnail.videoPath));
		thumbnail.inDeletion = true;
		this.showDeleteNotification = true;
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
		setTimeout(() => {
			thumbnail.inDeletion = false;
			this.showDeleteNotification = false;
			if (!(this.cdr as ViewRef)?.destroyed) {
				this.cdr.detectChanges();
			}
		}, 1500);
	}

	toggleDontAsk(event: Event) {
		event.stopPropagation();
		this.dontAsk = !this.dontAsk;
		this.prefs.setDontConfirmVideoDeletion(this.dontAsk);
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	hideConfirmationPopup(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.showConfirmationPopup = false;
		this.pendingDeletion = undefined;
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	// Prevent the window from being dragged around if user drags controls
	@HostListener('mousedown', ['$event'])
	onHistoryClick(event: MouseEvent) {
		const path: any[] = event['path'];
		for (const elem of path) {
			if (elem.localName === 'vg-controls') {
				event.stopPropagation();
				return;
			}
		}
	}

	// @HostListener('document:webkitfullscreenchange', ['$event'])
	// onFullScreenChange(event) {
	// 	amplitude.getInstance().logEvent('achievement-video', {
	// 		'action': 'full-screen',
	// 	});
	// 	this.fullscreen = !this.fullscreen;
	// 	if (!(this.cdr as ViewRef)?.destroyed) {
	// 		this.cdr.detectChanges();
	// 	}
	// }

	private async updateThumbnails(replayInfo: readonly ReplayInfo[]) {
		const deletedPaths: string[] = await this.buildDeletedPaths(replayInfo);
		this.thumbnails = replayInfo
			.filter(info => info)
			.map(info => {
				return {
					timestamp: info.creationTimestamp,
					completionDate: new Date(info.creationTimestamp).toLocaleDateString('en-GB', {
						day: '2-digit',
						month: '2-digit',
						year: '2-digit',
					}),
					videoLocation: info.url,
					videoPath: info.path,
					videoUrl: this.sanitizer.bypassSecurityTrustUrl(info.url),
					thumbnail: this.sanitizer.bypassSecurityTrustUrl(info.thumbnailUrl),
					stepId: info.completionStepId,
					iconSvg: this.buildIconSvg(info.completionStepId),
					isDeleted: deletedPaths.indexOf(info.path) !== -1,
				} as ThumbnailInfo;
			})
			.sort((a, b) => b.timestamp - a.timestamp);
		this.thumbnailsOffsetX = -this.indexOfFirstShown * this.thumbnailWidth;
		console.log('updated thumbnails', this.thumbnails);
		this.updateThumbnail(this.thumbnails[this.indexOfFirstShown]);
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
		setTimeout(() => this.cdr.detectChanges());
	}

	private updateThumbnail(thumbnail: ThumbnailInfo) {
		// console.log('updating thumbnail', thumbnail);
		this.currentThumbnail = thumbnail;
		this.currentVideoPathOnDisk = this.currentThumbnail ? this.currentThumbnail.videoPath : undefined;
		this.currentReplayLocation = this.currentThumbnail ? this.currentThumbnail.videoLocation : undefined;
		this.currentReplay = this.currentReplayLocation
			? this.sanitizer.bypassSecurityTrustUrl(this.currentReplayLocation)
			: undefined;
		// console.log('updated current replay', this.currentReplay);
		this.updateTitle();
		this.cdr.detectChanges();
	}

	private async isDeleted(path: string): Promise<boolean> {
		const fileExists = await this.ow.fileExists(path);
		// console.log('fileExists in component?', fileExists);
		return !fileExists;
	}

	private async buildDeletedPaths(replayInfo: readonly ReplayInfo[]): Promise<string[]> {
		const deletedPaths: string[] = [];
		for (const info of replayInfo) {
			// console.log('considering delete', info, info.path);
			const isDeleted: boolean = await this.isDeleted(info.path);
			// console.log('is deleted?', isDeleted);
			if (isDeleted) {
				deletedPaths.push(info.path);
			}
		}
		// console.log('deleted', deletedPaths);
		return deletedPaths;
	}

	private updateTitle() {
		if (!this.currentThumbnail) {
			return;
		}
		const date = new Date(this.currentThumbnail.timestamp).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit',
		});
		this.title = this.sanitizer.bypassSecurityTrustHtml(`
            <i class="icon">
                <svg class="svg-icon-fill">
                    <use xlink:href="/Files/assets/svg/sprite.svg#${this.buildIcon(this.currentThumbnail.stepId)}"/>
                </svg>
            </i>
            <div class="text">${this.buildText()}</div>
            <div class="date">${date}</div>
		`);
		// console.log('[achievement-recordings] new title', this.title);
	}

	private buildIconSvg(stepId: string) {
		return this.sanitizer.bypassSecurityTrustHtml(`
            <i class="icon-svg">
                <svg class="svg-icon-fill">
                    <use xlink:href="/Files/assets/svg/sprite.svg#${this.buildIcon(stepId)}"/>
                </svg>
            </i>`);
	}

	private buildIcon(stepId: string): string {
		const step = this._achievement.completionSteps.find(step => step.id === stepId);
		if (!step) {
			console.error('Could not find steo for', stepId, this._achievement);
			return '';
		}
		return step.icon;
	}

	private buildText(): string {
		const step = this._achievement.completionSteps.find(step => step.id === this.currentThumbnail.stepId);
		if (!step) {
			console.error(
				'Could not find step for',
				this.currentThumbnail.stepId,
				this._achievement,
				this.currentThumbnail,
			);
			return '';
		}
		return step.text(false);
	}
}
