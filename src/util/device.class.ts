import { Injectable } from '@angular/core';

import {IllegalArgumentError} from './error.model'; 

declare const Modernizr: any; // keep ts compiler calm

'use strict'; // Not in functions to make it easier to remove by build process

/** @classdesc Convenience class for holding all code dealing with queries about the device displaying the app in one place
 * A less ambitious attempt than e.g. https://github.com/ManuCutillas/ng2-responsive 
 * @constructor
 * @author Ulrik H. Gade, July 2016
 */
@Injectable()
export class Device {
	
	private _orientation = window.matchMedia('(orientation: portrait)').matches	? 'portrait' : 'landscape';

	/** Gets or sets the device's orientation
	 * @param {String} orientation Accepted values are 'portrait' or 'landscape' (without quotes, not case-sensitive)
	 * @return {String} The device's orientation. Possible values are 'portrait' or 'landscape' (without quotes).
	 * @todo combine with an event handler so the value gets updated when user rotates device
	 */
	public orientation(orientation: string): string;
	public orientation(): string;
	public orientation(): string {
		if (arguments.length > 0) { // setter
			let orientation:string = arguments[0].toLowerCase();
			if (['portrait','landscape'].indexOf(orientation) > -1) {
				this._orientation = orientation;
			}
			else {
				throw new IllegalArgumentError('Illegal orientation string: ' + orientation);
			}
		}
		return this._orientation;
	};
	
	/** Gets whether device runs Android or not
	 * @return {Boolean} true if device runs Android, otherwise false
	 */
	public isAndroid(): boolean {
		return /android/i.test(navigator.userAgent.toLowerCase());
	}

	/** Gets whether browser is Google Chrome or not
	 * @return {Boolean} true if browser is Chrome, otherwise false
	 */
	public isChrome(): boolean {
		return (/chrome/i.test(navigator.userAgent.toLowerCase()) && !/edge/i.test(navigator.userAgent.toLowerCase()))
			|| /crios/i.test(navigator.userAgent.toLowerCase()); // on iOS, Chrome identifies as 'CriOS'
	}
	
	/** Gets whether browser is Microsoft Edge or not
	 * @return {Boolean} true if browser is Edge, otherwise false
	 */
	public isEdge(): boolean {
			return /edge/i.test(navigator.userAgent.toLowerCase());
	}

	/** Gets whether browser is Internet Explorer or not
	 * @return {Boolean} true if browser is Explorer, otherwise false
	 */
	public isIE(): boolean {
			return /msie/i.test(navigator.userAgent.toLowerCase())
				|| /trident/i.test(navigator.userAgent.toLowerCase());
	}

	/** Gets whether browser is Mozilla Firefox or not
	 * @return {Boolean} true if browser is Firefox, otherwise false
	 */
	public isFirefox(): boolean {
		return /firefox|iceweasel|fxios/i.test(navigator.userAgent.toLowerCase());
	}

	/** Gets whether device runs iOS (i.e. is an Apple iPhone, iPad or iPod) or not
	 * @return {Boolean} true if device runs iOS, otherwise false
	 */
	public isiOS(): boolean {
		return /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());// && !window.MSStream; // fails compilation
	}

	/** Gets whether device is currently held in landscape orientation
	 * @return {Boolean} true if landscape, else false
	 */
	public isLandscape(): boolean {
		return this.orientation() === 'landscape';
	};

	/** Gets whether device runs Linux or not
	 * @return {Boolean} true if device runs Linux, otherwise false
	 */
	public isLinux(): boolean {
		return navigator.platform.toLowerCase().indexOf('linux') !== -1;
	}

	/** Gets whether device runs MacOS or not
	 * @return {Boolean} true if device runs MacOS, otherwise false
	 */
	public isMacOS(): boolean {
		return navigator.platform.toLowerCase().indexOf('mac') !== -1;
	}

	/** Gets whether device is mobile (i.e. phone or tablet) or not
	 * @return {Boolean} true if mobile, else false
	 * @todo Increase sophistication, taking inspiration from e.g. https://css-tricks.com/snippets/css/media-queries-for-standard-devices/
	 */
	public isMobile(): boolean {
		if (Modernizr.matchmedia) { // use media queries, if available (much preferred)
			// If none of the device's dimensions exceed 1024px, assume its a phone or tablet
			return window.matchMedia('(max-device-height: 1024px)').matches
				&& window.matchMedia('(max-device-width: 1024px)').matches
		} else { // brute force old school, even if it may raise eyebrows
			// We will very rarely need this, so risks are acceptable
			var isMobile = false;
			['android', 'blackberry', 'bb10', 'iemobile', 'ipad', 'ipod', 'opera mini', 'mobile'].forEach(function(key) {
				isMobile = isMobile || window.navigator.userAgent.toLowerCase().indexOf(key) > -1;
			});
			return isMobile;
		}
	};

	/** Gets whether browser is Opera or not
	 * @return {Boolean} true if browser is Opera, otherwise false
	 */
	public isOpera(): boolean {
		return /opera|opr|opios/i.test(navigator.userAgent.toLowerCase());
	}
	
	/** Gets whether device is currently held in portrait orientation
	 * @return {Boolean} true if portrait, else false
	 */
	public isPortrait(): boolean {
		return this.orientation() === 'portrait';
	};

	/** Gets whether browser is Safari or not
	 * @return {Boolean} true if browser is Safari, otherwise false
	 */
	public isSafari(): boolean {
		return /safari/i.test(navigator.userAgent.toLowerCase())
				&& !/chrome/i.test(navigator.userAgent.toLowerCase()) // chrome also reports as Safari
				&& !/crios/i.test(navigator.userAgent.toLowerCase());
	}

	/** Gets whether device runs Windows or not
	 * @return {Boolean} true if device runs Windows, otherwise false
	 */
	public isWindows(): boolean {
		return navigator.platform.toLowerCase().indexOf('win') !== -1;
	}

	/** Gets approximation of user's preferred language setting (locale) */
	public locale(): string {
		// Source: https://github.com/maxogden/browser-locale
		let lang: string;
		let navigator: any = window.navigator; // set up local to prevent ts compiler errors
  		if (navigator.languages) {
			// chrome does not currently set navigator.language correctly https://code.google.com/p/chromium/issues/detail?id=101138
			// but it does set the first element of navigator.languages correctly
			lang = navigator.languages[0]
		} else if (navigator.userLanguage) {
			// IE only
			lang = navigator.userLanguage
		} else {
			// as of this writing the latest version of firefox + safari set this correctly
			lang = navigator.language
		}
		return lang
	} 

	/** Converts Device object to JSON. Mostly needed to ease debugging on non-desktops (less typing).
	 * @return {Object} JSON object literal representation of Device's internal state
	 */
	public toJSON(): any {
		return {
			android: this.isAndroid(),
			chrome: this.isChrome(),
			edge: this.isEdge(),
			firefox: this.isFirefox(),
			IE: this.isIE(),
			iOS: this.isiOS(),
			landscape: this.isLandscape(),
			linux: this.isLinux(),
			locale: this.locale(),
			mac: this.isMacOS(),
			mobile: this.isMobile(),
			opera: this.isOpera(),
			orientation: this.orientation(),
			portrait: this.isPortrait(),
			safari: this.isSafari(),
			windows: this.isWindows()
		}
	};
};