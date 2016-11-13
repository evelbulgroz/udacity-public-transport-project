'use strict';

import { Component } from '@angular/core';
//import { Router} from '@angular/router';

import {htmlTemplate} from './about.component.html'; // include template in compiled bundle; external html may cause extra http request 
//import htmlTemplate: string from './launch.component.html'; // no need for ts literal when ts compiler catches up
import {styles} from './about.component.css'; // include template in compiled bundle; external html may cause extra http request 
//import styles: string from './launch.component.html'; // no need for ts literal when ts compiler catches up

/** @classdesc About view, providing a little background about the project and author */
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
export class AboutComponent {
	constructor() {}
		
}