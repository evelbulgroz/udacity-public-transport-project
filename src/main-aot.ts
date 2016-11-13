'use strict';

// bootstrap app using AoT compilation (in production)
import {enableProdMode} from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { AppModuleNgFactory } from './../aot/src/app.module.ngfactory';
enableProdMode();
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory)
	.then(success => console.log(`Bootstrap success`))
	.catch(error => console.log(error));