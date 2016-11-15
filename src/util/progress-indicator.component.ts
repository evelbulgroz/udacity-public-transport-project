'use strict';

import { Component, Input } from '@angular/core';

import {htmlTemplate} from './progress-indicator.component.html'; // include template in compiled bundle; external html may cause extra http request 
//import htmlTemplate: string from './journey-search.component.html'; // no need for ts literal when ts compiler catches up
import {styles} from './progress-indicator.component.css'; // include template in compiled bundle; external html may cause extra http request 
//import styles: string from './progress-indicator.component.html'; // no need for ts literal when ts compiler catches up

/**@classdesc Manages display of, and user interaction with, app wide progress indicator view (a spinning dot on a circular track).
 * Provides a static progress message that can be set in attribute to component's element.
*/
@Component({
	selector: 'progress-indicator',
	template: htmlTemplate,
	//templateUrl : 'util/progress-indicator.component.html',
	styles: styles,
	//styleUrls: ['util/progress-indicator.component.css'],
	viewProviders: [ // was: directives
	],
	providers: []
})
export class ProgressIndicatorComponent {
	@Input() label: string = 'Working on it...';
}