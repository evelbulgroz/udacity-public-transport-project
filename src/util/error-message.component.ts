'use strict';

import { Component, EventEmitter, Output } from '@angular/core';

import {htmlTemplate} from './error-message.component.html'; // include template in compiled bundle; external html may cause extra http request 
//import htmlTemplate: string from './journey-search.component.html'; // no need for ts literal when ts compiler catches up
import {styles} from './error-message.component.css'; // include template in compiled bundle; external html may cause extra http request 
//import styles: string from './error-message.component.html'; // no need for ts literal when ts compiler catches up

/**@classdesc Manages display of, and user interaction with, app wide Error view.
 * Provides a generic error messages and a widget that allows user to dismiss it.
*/
@Component({
	selector: 'error-message',
	template: htmlTemplate,
  	//templateUrl : 'util/error-message.component.html',
	styles: styles,
	//styleUrls: ['util/error-message.component.css'],
	viewProviders: [],
	providers: [
	]
})
export class ErrorMessageComponent {
	
	@Output() onErrorOK = new EventEmitter<any>();

	/** Bubbles OK tap/click event up to parent component */
	public onOKClick(event: any) {
		this.onErrorOK.emit(event);
	}
}