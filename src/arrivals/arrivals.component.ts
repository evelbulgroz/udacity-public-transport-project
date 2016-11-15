'use strict';

// imports
	import { Component } from '@angular/core';
	
	import {applyMixins} from './../util/mixin';
	import {ArrivalService} from './arrival.service';
	import {ComponentState} from './../util/component-state.model';
	import {LocationService} from './../locationsearch/location.service';
	import {PersistableComponent, PersistableComponent_Defaults} from './../util/persistable-component.interface';
	import {Stop} from './../core/stop.model';
	import {StopTime} from './../core/stop-time.model';
	import {Trip} from './../core/trip.model';
	
	import moment from 'moment'; // works when transpiled to 'system' module format (in tsconfig.json)
	import 'moment-timezone'; // only wanted for the side effects on main moment

	import {htmlTemplate} from './arrivals.component.html'; // include template in compiled bundle; external html may cause extra http request 
	//import htmlTemplate: string from './journey-search.component.html'; // no need for ts literal when ts compiler catches up
	import {styles} from './arrivals.component.css'; // include template in compiled bundle; external html may cause extra http request 
	//import styles: string from './arrivals.component.html'; // no need for ts literal when ts compiler catches up?

/**@classdesc Manages display of, and user interaction with, the Arrivals view.
 * Enables user to search for, and see a list of, rail transit arrivals at any station in the network.
 * Operates exclusively on core models in order to decouple from any concrete transit API.  
*/
@Component({
	selector: 'public-transport-app-departures',
	template: htmlTemplate,
  	//templateUrl : 'arrivals/arrivals.component.html', // ngc compiler disagrees with dev module loader about path here, so using import instead
	styles: styles,
	//styleUrls: ['arrivals/arrivals.component.css'],
	viewProviders: [],
	providers: [
		//ArrivalService,
		LocationService
	]
})
export class ArrivalsComponent implements PersistableComponent {
	public arrivals: Array<any> = []; // Array<Trip>
	public error: boolean = false;
	public ready: boolean = false;
	public searchComplete: boolean = false;
	public searchInProgress: boolean = false;
	public stop: any = null;
	public stopId: string = '';
	public stopSuggestions: Array<Stop> = []; // used for storage and retrieval of component state 
	public stopSuggestionsJSON: any = []; // used by vaadin-combobox UI component
	public valid: boolean = false;

	constructor(
		private _arrivalService: ArrivalService, // provided in AppModule so master and detail can share same instance
		private _locationService: LocationService) {
	}
	
	/** Fetches list of arrivals at provided stop and date/time */
	public getArrivals(stop: Stop, date: Date, useTrain: boolean = true, useBus: boolean = false, useMetro: boolean = false): Promise<any> {
		let self = this;
		return this._arrivalService.fetchArrivals(stop, date, useTrain, useBus, useMetro)
			.then(function(result: Trip[]) {
				self.searchComplete = true;
				self.searchInProgress = false;
				self.arrivals = result;
				return self.storeState();
				//return result;
			})
			.catch(function(e: Error) {
				self.error = true;
				return Promise.reject(e);
			})
	}

	/** Gets and formats arrival time for display in list (using local Copenhagen time) */
	getArrivalTime(trip: Trip) {
		let arrival: StopTime = trip.getStopTimeByStopName(this.stop.name()) || trip.stopTimes()[trip.stopTimes().length - 1];		
		return moment(arrival.arrivalPlanned()).tz('Europe/Copenhagen').format('hh:mm a');
	}
	
	/** Gets and formats arrival date for display in list header */
	getDate() {
		return moment(new Date()).format('ddd, MMM D, YYYY h:mm a');
	}
	
	/** Populates locations list for autocomplete in stop input field */
	public getStopSuggestions(query: string): Promise<Array<Stop>> {
		let self = this;
		return this._locationService.fetchLocations(query)
			.then((suggestions: Array<Stop>) => {
				self.stopSuggestions = suggestions;
				self.stopSuggestionsJSON = JSON.parse(JSON.stringify(suggestions));  // Flatten object model into json required by vaadin-combo-box
				return Promise.resolve(suggestions);
			})
			.catch((e: Error) => {
				return Promise.reject(e);
			})
	}
	
	/** Defaults display to existing search results, if any */
	public ngOnInit(): void {
		if (this._arrivalService.arrivals().length > 0) { // restore state from memory when navigating back from other view
			this.arrivals = this._arrivalService.arrivals();
			let query = this._arrivalService.query();
			this.stop = query.stop;
			this.stopId = query.stopId;
			this.stopSuggestions = query.stopSuggestions;
			this.ready = true;
			this.searchComplete = true;
		}
		else { // restore state from local storage on first load, if available
			void this.restoreState('ArrivalsComponent')
				.then((state: ComponentState) => {
					if (state) {
						if (state.data()) {
							this.arrivals = state.data();
						}
						if (state.query()) {
							if (state.query().stop) {
								this.stop = state.query().stop;
								this.stopId = state.query().stop.modelId();
							}
							if (state.query().stopSuggestions) {
								this.stopSuggestions = state.query().stopSuggestions;
								this.stopSuggestionsJSON = JSON.parse(JSON.stringify(state.query().stopSuggestions));
							}
						}
						this.searchComplete = true;
					}
					this.ready = true;
				})
				.catch((e) => {
					console.log(e);
				});
		}
	}

	/** Resets view after error is acknowledged by user (in error-message component) */
	public onErrorOK() {
		this.error = this.searchComplete = this.searchInProgress = false;
	}

	/** Fetches from/to autocomplete suggestions in response to user entries into stop field */
	public onStopKeyUp(event: any) {
		let query: string = event.target.value;
		if (query.length < 4) { // clear for new entry
			this.stopSuggestionsJSON = [];
		}
		else if (this.stopSuggestionsJSON.length === 0) { // call location service, if needed
			void this.getStopSuggestions(query); // calling for side-effect, so discarding promise
		}
		// else do nothing: repeated updates obscure suggestions from users
	}
	
	/** Fetches and displays arrivals matching selected stop */
	public onSearch() {
		this.searchInProgress = true;
		this.getArrivals(this.stop, new Date());
	}

	/** Re-displays stop selector */
	public onChangeSearch() {
		this.searchComplete = false;
		this.searchInProgress = false;
		return false;
	}

	/** Captures selection (change) event in stop selector */
	public onStopChange(event: any) {
		if (event.detail.value !== null) {
			let stop: Stop = this.stopSuggestions.find((stop: Stop) => {
				return stop.modelId() === event.detail.value._modelId;
			});
			this.stop = stop;
			this.valid = true;
		}
		else {
			this.stop = null;
			this.valid = false;
		}
	}
	
	// Reacts to tap/click in arrivals list (not implemented)
	public onArrivalSelected(arrival: Trip) {
		if (arrival instanceof Trip) {
			this._arrivalService.fetchArrivalDetails(arrival)
				.then(() => {
					console.log(arrival);
					void this.storeState();
				})
				.catch((e) => {
					console.log(e);
				});
		}
	}

	/** Stores the component's current state in local storage
	 * after clearing previous state from storage
	 */
	public storeState(): Promise<number> {
		(() => { // dedupe stops (getting arrival details may cause lots of redundancy)
			let stop: Stop;
			let stops: Map<string, Stop> = new Map<string, Stop>();
			this.arrivals.forEach((arrival: Trip) => {
				arrival.stopTimes().forEach((stopTime: StopTime) => {
					if (stopTime.stop() && stopTime.stop().name()) {
						stop = stops.get(stopTime.stop().name().toLowerCase());
						if (!stop) {
							void stops.set(stopTime.stop().name().toLowerCase(), stopTime.stop())
						}
						else {
							void stopTime.stop(stop);
						}
					}
				});
			});
		})();
		let state: ComponentState = new ComponentState(
			'ArrivalsComponent',
			this.arrivals,
			{
				stop: this.stop,
				stopSuggestions: this.stopSuggestions
			}
		);
		return state.writeObject(state);
	}

	/** Retrieves and recreates the component's latest state from local storage */
	public restoreState(componentName: string): Promise<ComponentState> {
		// can't get mixin to work, so doing it manually for now
		return PersistableComponent_Defaults.prototype.restoreState.call(this, componentName);
	}
}

// Mix in default interface methods
applyMixins(ArrivalsComponent, [PersistableComponent_Defaults], false);