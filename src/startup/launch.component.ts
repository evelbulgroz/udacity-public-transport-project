'use strict';

import { Component } from '@angular/core';
import { Router} from '@angular/router';

import {ArrivalsComponent} from './../arrivals/arrivals.component';
import {DeparturesComponent} from './../departures/departures.component';
import {JourneyComponent} from './../journeyplanner/journey.component';
import {JourneyDetailsComponent} from './../journeyplanner/journey-details.component';
import {localStorage as storage} from './../app.module';

import {htmlTemplate} from './launch.component.html'; // include template in compiled bundle; external html may cause extra http request 
//import htmlTemplate: string from './launch.component.html'; // no need for ts literal when ts compiler catches up
import {styles} from './launch.component.css'; // include template in compiled bundle; external html may cause extra http request 
//import styles: string from './launch.component.html'; // no need for ts literal when ts compiler catches up

/** @classdesc Startup screen after initial, static splash. Redirects to stored component or, failing that, root component (as defined in routing module) */
@Component({
	selector: 'startup',
	template: htmlTemplate,
	//templateUrl : 'util/progress-indicator.component.html',
	styles: styles,
	//styleUrls: ['util/progress-indicator.component.css'],
	viewProviders: [ // was: directives
	],
	providers: []
})
export class LaunchComponent {
	constructor(private _router: Router) {}

	public ngOnInit() {
		void this._router
		void storage.getAll(true)
			.then((json: any) => {
				let config: any = this._router.config, path: string;
				// set path to stored component (if available)...
				for (let key in json) { // get state object from storage
					if (json[key]._className === 'ComponentState'
						&& json[key]._componentName) {
							let component: any = { // get reference to stored component from name
								'ArrivalsComponent': ArrivalsComponent,
								'DeparturesComponent': DeparturesComponent,
								'JourneyComponent': JourneyComponent,
								'JourneyDetailsComponent': JourneyDetailsComponent
							}[json[key]._componentName];
							for (let route in config) { // set path
								if (config[route].component === component) {
									path = '/' + config[route].path;
								}
							}
					}
				}
				// ...else, set path to root component
				if (!path) {
					for (let route in config) {
						if (config[route].data && config[route].data.root) {
							path = '/' + config[route].path;
						}
					}
				}
				// navigate to path
				this._router.navigate([path]);
			})
			.catch((e) => {
				console.log(e);
			});
	}
}