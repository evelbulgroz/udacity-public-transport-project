'use strict';

// imports
	import { Component, EventEmitter, Input, Output } from '@angular/core';

	import {Device} from './../util/device.class';
	import {LatLng} from './../core/latlng.model';
	import {LocationService} from './../locationsearch/location.service';
	import {preferences} from './../app.module';
	import {Stop} from './../core/stop.model';

	declare let Modernizr: any; // import global so ts compiler doesn't complain
	//import * as _ from 'lodash'; // works in dev but breaks the build
	
	import {htmlTemplate} from './journey-search.component.html'; // include template in compiled bundle; external html may cause extra http request 
	//import htmlTemplate: string from './journey-search.component.html'; // no need for ts literal when ts compiler catches up
	import {styles} from './journey-search.component.css'; // include template in compiled bundle; external html may cause extra http request 
	//import styles: string from './progress-indicator.component.html'; // no need for ts literal when ts compiler catches up

/**@classdesc Manages display of, and user interaction with, the search form in the Journey Planner view.
 * Enables user to enter journey search terms and submit the search.
*/
@Component({
	selector: 'journey-search',
	template: htmlTemplate,
	//templateUrl: './journeyplanner/journey-search.component.html', // ngc compiler disagrees with dev module loader about path here, so using import instead
	styles: styles,
	//styleUrls: ['./journeyplanner/journey-search.component.css'],
	viewProviders: [],
	providers: [Device,	LocationService]
})
/** @classdesc Manages journey search form.
 * Expects to be embedded in containing component taking care of
 * search execution and presentation of search results
*/
export class JourneySearchComponent {
	// attributes
		@Input() public date: any = null;
		public datetime: string = '';
		@Input() public destination: any = null;
		public destinationId: string = ''; // '14';
		public destinationSuggestions: any = null; // [{id: '14', name:'Test Destination', x: 1, y: 2}];
		@Input() public origin: any = null;
		public originId: string = ''; //'12';
		public originSuggestions: any = null; // = [{id: '12', name:'Test Origin', x: 1, y: 2}];
		public time: string;
		
		public Modernizr: any = Modernizr; // workaround: can't figure out how to 'import' library in global scope (tried, failed!)

		@Output() onFindJourney = new EventEmitter<any>(); // call parent component on submit
		public valid: boolean = false; 

	// workaround until I out figure out how to use lodash without breaking the build
	private _padStart(string: string, length: number, chars: string): string {
		while (string.length < length) {string = chars + string;}
		return string;
	}

	public constructor(
		public device: Device, private _service: LocationService) {
	}
		
	// operations
		/* Converts date into string format agreeable to vaading-date-picker */
		private _formatDate(date: Date): string {
			return date.getFullYear()
			+ '-'
			+ this._padStart(String(date.getMonth() + 1), 2, '0')
			+ '-'
			+ this._padStart(String(date.getDate()), 2, '0');
		}

		/* Converts date into string format agreeable to native datetime-local widgets */
		private _formatDateTime(date: Date): string {
			return date.getFullYear() // Native datetime-locals require an ISO 8601 string with no trailing 'Z'
			+ '-'
			+ this._padStart(String(date.getMonth() + 1), 2, '0')
			+ '-'
			+ this._padStart(String(date.getDate()), 2, '0')
			+ 'T'
			+ this._padStart(String(date.getHours()), 2, '0')
			+ ':'
			+ this._padStart(String(date.getMinutes() + 1), 2, '0');
		}

		/* Converts date into 24h time string */
		private _formatTime(date: Date): string {
			return this._padStart(String(date.getHours()), 2, '0')  // 'hh:mm' (24h)
			+ ':'
			+ this._padStart(String(date.getMinutes() + 1), 2, '0');
		}
		
		/** Populates locations list for autocomplete in from/to (i.e. origin/destination) input fields */
		public fetchLocations(query: string, target: string) {
			let suggestions: any = [];
			this._service.fetchLocations(query)
				.then((result: Stop[]) => {
					// Flatten object model into json object array required by vaadin-combo-box
					if (result.forEach) { // service did not come up empty
						result.forEach((stop) => {
							suggestions.push(stop.toJSON());
						});
					}
					if (target.toLowerCase() === 'origin') {
						this.originSuggestions = suggestions;
					}
					else {
						this.destinationSuggestions = suggestions;
					}
				})
				.catch((e: Error) => {
					// Maybe later collect frequently used stations for offline use;
					// but for now, just show a brief error message when search fails  
					let toast: any = document.getElementById('journey-search-toast');
					toast.show({duration: preferences.defaultToastDuration});
					console.log(e);
				})
		}
		
		/** Converts any data updated by parent component to formats required by UI widgets */
		public ngOnChanges(changes: any) {
			void changes; // keep ngc build compiler happy; no actual need for changes object here
			this.origin = this.origin && this.origin.toJSON ? this.origin.toJSON() : null;
			if (this.origin) {
				this.originId = this.origin._modelId;
				this.originSuggestions = [this.origin];
			}
			this.destination = this.destination && this.destination.toJSON ? this.destination.toJSON() : null;
			if (this.destination) {
				this.destinationId = this.destination._modelId;
				this.destinationSuggestions = [this.destination];
			}
			if (this.date && this.date instanceof Date) {
				this.datetime = this._formatDateTime(this.date);
				this.time = this._formatTime(this.date);
				this.date = this._formatDate(this.date);
			}
		}
		
		/** Sets date/time defaults on initial load
		 * - using device date and time as if they were in local API time zone
		 */
		public ngOnInit() {
			let now: Date = new Date();
			this.datetime = this._formatDateTime(now); 		
			this.date = this._formatDate(now); // vaadin picker expects 'yyyy-mm-dd'
			this.time = this._formatTime(now);
		}

		/** Captures user selection in vaadin-date-picker (can't get regular binding to work) */
		public onDateChange(event: any): void {
			if (event && event.srcElement.date && event.srcElement.date.constructor === Date) {
				this.date = this._formatDate(event.srcElement.date);
			}			
		}
		
		/** Captures updates to component data when entries are made/deleted in from/to fields */
		public onFromToChange(event: any) {
			this[event.target.name] = event.detail.value;
			this.valid = this.origin !== null && this.destination !== null;
		}
	
		/** Fetches from/to autocomplete suggestions in response to user entries into from/to fields */
		public onFromToKeyUp(event: any) {
			let query: string = event.target.value; 
			let target = event.target.name;
			if (query.length < 4) { // clear for new entry
				this[target + 'Suggestions'] = [];
			}
			else if (this[target + 'Suggestions'].length === 0) { // call location service, if needed
				this.fetchLocations(query, target);
			}
			// else do nothing: repeated updates obscure suggestions from users
		}
		
		/** Executes location search */
		public onSearch() {
			let now: Date = new Date();
			
			// parses entry in datepicker into ISO date format ('YYYY-MM-DD', with leading zeroes)
				function _parseDate(date: string): string {
					// value from vaadin date picker is already formatted correctly, so should normally pass the check
					return !isNaN(Date.parse(date)) ? date : now.toISOString().split('T')[0];
				}
	
			// parses entry in time input into ISO time format ('mm:hh:ss', with leading zeroes)
				function _parseTime(time: any): string {
					let isPM: boolean = time.toLowerCase().indexOf('pm') > -1;
					time = time.replace(/\D/g, '').split(''); // strip non-digits, get array of single characters
					let hours: string = (time[time.length-4] !== undefined ? time[time.length-4] : '0' )  // tens of hours
								+ (time[time.length-3] !== undefined ? time[time.length-3] : '0' )  // single hours
					hours = isPM ? String(Number(hours) + 12) : hours; // adjust for pm
					time = !time.length ? now.toTimeString().split(' ')[0] : // use current time if no input
						String(hours) + ':' // 24h hours
						+ (time[time.length-2] ? time[time.length-2] : '0' ) // tens of minutes
						+ (time[time.length-1] ? time[time.length-1] : '0' ) // single minutes
						+ ':00'; //seconds
					return time;
				}
			
			let origin = (!this.origin) ? undefined : new Stop(
				this.origin._apiId,
				this.origin._name,
				new LatLng(this.origin._location._lat, this.origin._location._lng)
			);
			let destination = (!this.destination) ? undefined : new Stop(
				this.destination._apiId,
				this.destination._name,
				new LatLng(this.destination._location._lat, this.destination._location._lng)
			);
			
			let date: Date;
			if (document.getElementById('datetime')) { // default to datetime-local value when available
				date = !isNaN(Date.parse(this.datetime)) ? new Date(this.datetime) : now; // cast to Date, or default to now
			}
			else { // use fallback (string parsing could be unreliable, but seems to work)
				this.datetime = _parseDate(this.date) + 'T' + _parseTime(this.time) + 'Z'; // parse date and time entries
				date = !isNaN(Date.parse(this.datetime)) ? new Date(this.datetime) : now; // cast to UTC Date, or default to now

			}
			void date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // adjust for timezone offset
			this.onFindJourney.emit({origin: origin, destination: destination, date: date}); // pass entries to parent component
		}
}
