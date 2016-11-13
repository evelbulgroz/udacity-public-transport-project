'use strict';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import {AppModule} from './app.module';

// bootstrap app using JIT compilation (i.e. during development)
platformBrowserDynamic().bootstrapModule(AppModule)
	.then(success => {console.log('Bootstrap success'); void success})
	.catch(error => console.log(error));