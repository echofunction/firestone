import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { PreferencesService } from '../preferences.service';

const EBS_URL = 'https://twitch.firestoneapp.com/deck/event';
// const EBS_URL = 'http://localhost:8081/deck/event';

const CLIENT_ID = 'jbmhw349lqbus9j8tx4wac18nsja9u';
const REDIRECT_URI = 'overwolf-extension://lnknbakkpommmjjdnelmfbjjdbocfpnpbkijjnob/Files/twitch-auth-callback.html';
const SCOPES = 'channel_read';
const LOGIN_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPES}`;
const TWITCH_VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';
const TWITCH_USER_URL = 'https://api.twitch.tv/kraken/user';

@Injectable()
export class TwitchAuthService {

    public stateUpdater = new EventEmitter<any>();

	constructor(private prefs: PreferencesService, private http: HttpClient) {
        console.log('assigning updater', this.stateUpdater);
        window['twitchAuthUpdater'] = this.stateUpdater;

		this.stateUpdater.subscribe((twitchInfo: any) => {
            console.log('received access token', twitchInfo);
            this.saveAccessToken(twitchInfo.access_token);
        });
        console.log('twitch auth handler init done', window['twitchAuthUpdater'], window);
    }

    public async emitDeckEvent(event: any) {
        // console.log('ready to emit twitch event');
        const prefs = await this.prefs.getPreferences();
        if (!prefs.twitchAccessToken) {
            // console.log('no twitch access token, returning');
            return;
        }
        const httpHeaders: HttpHeaders = new HttpHeaders()
                .set('Authorization', `Bearer ${prefs.twitchAccessToken}`);
        this.http.post(EBS_URL, event, { headers: httpHeaders} ).subscribe((data) => {
            // Do nothing
            // console.log('twitch event result', data);
        }, (error) => {
            console.error('Could not send deck event to EBS', error);
        });
    }

    public buildLoginUrl(): string {
        return LOGIN_URL;
    }

    public async isLoggedIn(): Promise<boolean> {
        const prefs = await this.prefs.getPreferences();
        // Never added an access token
        if (!prefs.twitchAccessToken) {
            return false;
        }
        // Handle expired tokens?
        const isTokenValid = await this.validateToken(prefs.twitchAccessToken);
        return isTokenValid;
    }

    private async validateToken(accessToken: string): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
            const httpHeaders: HttpHeaders = new HttpHeaders()
                    .set('Authorization', `OAuth ${accessToken}`);
            this.http.get(TWITCH_VALIDATE_URL, { headers: httpHeaders} ).subscribe((data) => {
                console.log('validating token', data);
                resolve(true);
            }, (error) => {
                resolve(false);
            });
        });
    }

    private async retrieveUserName(accessToken: string): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
            const httpHeaders: HttpHeaders = new HttpHeaders()
                    .set('Authorization', `OAuth ${accessToken}`);
            this.http.get(TWITCH_USER_URL, { headers: httpHeaders} ).subscribe((data: any) => {
                console.log('received user info', data);
                this.prefs.setTwitchUserName(data.display_name);
            }, (error) => {
                resolve(false);
            });
        });
    }
    
    private async saveAccessToken(accessToken: string) {
        await this.validateToken(accessToken);
        await this.prefs.setTwitchAccessToken(accessToken);
        await this.retrieveUserName(accessToken);
    }
}
