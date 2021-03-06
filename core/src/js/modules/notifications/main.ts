import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NotificationsModule } from './notifications.module';

if (process.env.NODE_ENV === 'production') {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule(NotificationsModule);
