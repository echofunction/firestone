import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OverwolfService } from './overwolf.service';

const NO_AD_PLAN = 13;
const SUBSCRIPTION_STATUS_ENDPOINT_GET = 'https://rpeze8ckdl.execute-api.us-west-2.amazonaws.com/Prod/subscriptions';

@Injectable()
export class AdService {
	constructor(private http: HttpClient, private ow: OverwolfService) {}

	public async shouldDisplayAds(): Promise<boolean> {
		if (process.env.NODE_ENV !== 'production') {
			console.error('forcing display in dev');
			return true;
		}
		return new Promise<boolean>(async resolve => {
			// Use OW's subscription mechanism
			const [activePlans, user] = await Promise.all([
				this.ow.getActiveSubscriptionPlans(),
				this.ow.getCurrentUser(),
			]);
			if (activePlans && activePlans.plans && activePlans.plans.indexOf(NO_AD_PLAN) !== -1) {
				console.log('User has a no-ad subscription, not showing ads', activePlans);
				resolve(false);
				return;
			}
			if (!user || !user.username) {
				resolve(true);
				return;
			}
			const username = user.username;
			if (!username) {
				console.log('user not logged in', user);
				resolve(true);
				return;
			}
			console.log(
				'contacting subscription API',
				`${SUBSCRIPTION_STATUS_ENDPOINT_GET}/${user.userId}/${username}`,
			);
			this.http.get(`${SUBSCRIPTION_STATUS_ENDPOINT_GET}/${user.userId}/${username}`).subscribe(
				res => {
					console.log('retrieved sub status for', username, res);
					resolve(false);
					return;
				},
				error => {
					console.log('no subscription, showign ads');
					resolve(true);
					return;
				},
			);
		});
	}
}