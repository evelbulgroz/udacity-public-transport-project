// imports
	import { Component } from '@angular/core';
	
	import {applyMixins} from './../util/mixin';
	import {ComponentState} from './../util/component-state.model';
	import {DepartureService} from './departure.service';
	import {LocationService} from './../locationsearch/location.service';
	import {PersistableComponent, PersistableComponent_Defaults} from './../util/persistable-component.interface';
	import {Stop} from './../core/stop.model';
	import {StopTime} from './../core/stop-time.model';
	import {Trip} from './../core/trip.model';
	
	import moment from 'moment'; // works when transpiled to 'system' module format (in tsconfig.json)
	import 'moment-timezone'; // only wanted for the side effects on main moment

	import {htmlTemplate} from './departures.component.html'; // include template in compiled bundle; external html may cause extra http request 
	// import htmlTemplate: string from './journey-search.component.html'; // no need for ts literal when ts compiler catches up
	import {styles} from './departures.component.css'; // include template in compiled bundle; external html may cause extra http request 
	//import styles: string from './departures.component.html'; // no need for ts literal when ts compiler catches up?


@Component({
	selector: 'public-transport-app-departures',
	template: htmlTemplate,
  	//templateUrl : 'departures/departures.component.html', // ngc compiler disagrees with dev module loader about path here, so using import instead
	styles: styles,
	//styleUrls: ['departures/departures.component.css'],
	viewProviders: [],
	providers: [
		//DepartureService,
		LocationService
	]
})
export class DeparturesComponent implements PersistableComponent {
	public departures: any = [];
	public error: boolean = false;
	public ready = false;
	public searchComplete: boolean = false;
	public searchInProgress: boolean = false;
	public stop: any = null;
	public stopId: string = '';
	public stopSuggestions: Array<Stop> = []; // used for storage and retrieval of component state 
	public stopSuggestionsJSON: any = []; // used by vaadin-combobox UI component
	public valid: boolean = false;
	
	constructor(
		private _departureService: DepartureService, // provided in AppModule so master and detail can share same instance
		private _locationService: LocationService) {
			
	}

	/** Gets and formats departure date for display in list header */
	getDate() {
		return moment(new Date()).format('ddd, MMM D, YYYY h:mm a');
	}
	
	/** Fetches list of departures at provided stop and date/time */
	public getDepartures(stop: Stop, date: Date, useTrain: boolean = true, useBus: boolean = false, useMetro: boolean = true): Promise<any> {
		let self = this;
		return this._departureService.fetchDepartures(stop, date, useTrain, useBus, useMetro)
			.then((departures: Trip[]) => {
				self.searchComplete = true;
				self.searchInProgress = false;
				self.departures = departures;
				void self.storeState();
				return Promise.resolve(departures);
			})
			.catch(function(e: Error) {
				self.error = true;
				return Promise.reject(e);
			})
	}

	// Gets and formats departure time for display in list
	getDepartureTime(trip: Trip) {
		let departure: StopTime = trip.getStopTimeByStopName(this.stop.name()) || trip.stopTimes()[0];
		return moment(departure.departurePlanned()).tz('Europe/Copenhagen').format('hh:mm a');
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
	public ngOnInit() {
		if (this._departureService.arrivals().length > 0) { // restore state from memory when navigating back from other view
			this.departures = this._departureService.arrivals();
			let query = this._departureService.query();
			this.stop = query.stop;
			this.stopId = query.stopId;
			this.stopSuggestions = query.stopSuggestions;
			this.ready = true;
			this.searchComplete = true;
		}
		else { // restore state from local storage on first load, if available
			void this.restoreState('DeparturesComponent')
				.then((state: ComponentState) => {
					if (state) {
						if (state.data()) {
							this.departures = state.data();
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
	
	/** Fetches and displays departures matching selected stop */
	public onSearch() {
		this.searchInProgress = true;
		this.getDepartures(this.stop, new Date());
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
	
	// Reacts to tap/click in departures list (not implemented)
	public onDepartureSelected(departure: Trip) {
		if (departure instanceof Trip) {
			this._departureService.fetchDepartureDetails(departure)
				.then(() => {
					console.log(departure);
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
		(() => { // dedupe stops (getting departure details may cause lots of redundancy)
			let stop: Stop;
			let stops: Map<string, Stop> = new Map<string, Stop>();
			this.departures.forEach((departure: Trip) => {
				departure.stopTimes().forEach((stopTime: StopTime) => {
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
			'DeparturesComponent',
			this.departures,
			{
				stop: this.stop,
				stopSuggestions: this.stopSuggestions
			}
		);
		return state.writeObject(state);
	}

	/** Retrieves and recreates the component's latest state from local storage */
	public restoreState(componentName: string): Promise<any> {
		// can't get mixin to work, so doing it manually for now
		return PersistableComponent_Defaults.prototype.restoreState.call(this, componentName);
	}
}

// Mix in default interface methods
applyMixins(DeparturesComponent, [PersistableComponent_Defaults], false);