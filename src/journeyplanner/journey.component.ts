'use strict';

// imports
	import { Component} from '@angular/core';
	import { Router } from '@angular/router';
	
	import {applyMixins} from './../util/mixin';
	import {ComponentState} from './../util/component-state.model';
	import {Journey} from './../core/journey.model';
	import {JourneyService} from './journey.service';
	import {Leg} from './../core/leg.model';
	import {localStorage as storage} from './../app.module';
	import {PersistableComponent, PersistableComponent_Defaults} from './../util/persistable-component.interface';
	import {Stop} from './../core/stop.model';
	import {StopTime} from './../core/stop-time.model';

	import moment from 'moment'; // works when transpiled to 'system' module format (in tsconfig.json)
	import tz from 'moment-timezone'; // only wanted for the side effects on main moment function
	void tz; // keep compiler happy
	
	import {htmlTemplate} from './journey.component.html'; // include template in compiled bundle; external html may cause extra http request 
	// import htmlTemplate: string from './journey-search.component.html'; // no need for ts literal when ts compiler catches up
	import {styles} from './journey.component.css'; // include template in compiled bundle; external html may cause extra http request 
	//import styles: string from './journey.component.css'; // no need for ts literal when ts compiler catches up?


@Component({
	selector: 'public-transport-app-planner',
	template: htmlTemplate,
  	styles: styles
})
export class JourneyComponent implements PersistableComponent {
	public date: Date = null;
	public destination: Stop = null;
	public journeys: any = [];
	public origin: Stop = null;
	
	public error: boolean = false;
	public ready: boolean = false;
	public searchInProgress: boolean = false;
	public searchComplete: boolean = false;
	
	public constructor(
		private _router: Router,
		private _service: JourneyService // provided in AppModule so master and detail can share same instance
		//private _storage: LocalStorage // seems to time out, so providing instance from AppModule
		) {
	}

	/** Fetches later journeys and add them to the existing list */
	public addLaterJourneys(): Promise<Array<Journey>> {
		let self = this;
		let lastOrigin: StopTime = this.journeys[this.journeys.length - 1].legs()[0].origin();
		let lastDeparture: Date = lastOrigin.departurePlanned() || lastOrigin.departureActual(); 
		return this._service.fetchLaterJourneys(this.origin, this.destination, lastDeparture, true, false, true, this.journeys)
			.then(function(laterJourneys: Journey[]) {
				self.journeys = self.journeys.concat(laterJourneys);
				void self.storeState();
				return Promise.resolve(self.journeys);
			})
			.catch(function(e: Error) {
				self.error = true;
				return Promise.resolve(e);
			});
	}
	
	/** Gets and formats arrival time for display in list (using local Copenhagen time) */
	public getArrivalTime(journey: Journey): string {
		return moment(journey.legs()[journey.legs().length-1].destination().arrivalPlanned()).tz('Europe/Copenhagen').format('h:mm a');
	}
	
	/** Gets and formats changes for display in list */
	public getChanges(journey: Journey): string {
		let changes = journey.legs().length - 1;
		return changes + ' change' + (changes !== 1 ? 's' : '');
	}
	
	/** Gets and formats departure date for display in list header */
	public getDate(): string {
		return this.date ? moment(this.date).format('ddd, MMM D, YYYY h:mm a') : '';
	}
	
	/** Gets and formats departure time for display in list (using local Copenhagen time) */
	public getDepartureTime(journey: Journey): string {
		let time: Date = journey.legs()[0].origin().departureActual() || journey.legs()[0].origin().departurePlanned();
		return moment(time).tz('Europe/Copenhagen').format('h:mm a');
	}
	
	/** Gets and formats journey duration for display in list */
	public getDuration(journey: Journey) {
		let leg: Leg = journey.legs()[0],
		departure = leg.origin().departureActual() || leg.origin().departurePlanned();
		leg = journey.legs()[journey.legs().length - 1];
		let arrival = leg.destination().arrivalActual() || leg.destination().arrivalPlanned(),
		duration: any = moment.duration(arrival.valueOf() - departure.valueOf());
		if (duration.hours() === 0) { // less than one hour
			return duration.minutes() + ' min.';
		}
		else { // more than one hour
			return duration.hours() + ':' + (duration.minutes() < 10 ? '0' : '') + duration.minutes();
		}
		//return '1:23';
	}
	
	/** Fetches list of journey options given provided origin, destination and date/time
	 * Data binding causes Angular to refresh UI when changes are made to the journey collection,
	 * so no need to wrap this in Promise for now.
	 */
	public getJourneyList(
		origin: Stop,
		destination: Stop,
		date: Date,
		useTrain: boolean = true,
		useBus: boolean = false,
		useMetro: boolean = false,
		via?: Stop): Promise<Array<Journey>> {
			let self = this;
			return this._service.fetchJourneyList(origin, destination, date, useTrain, useBus, useMetro, via)
				.then(function(result: Journey[]) {
					self.journeys = result;
					self.searchInProgress = false;
					self.searchComplete = true;
					void self.storeState();
					return Promise.resolve(result);
				})
				.catch(function(e: Error) {
					self.error = true;
					return Promise.reject(e);
				});
	}

	/** Defaults display to existing search results, if any */
	public ngOnInit() {
		if (this._service.journeys().length > 0) { // restore state from memory when navigating back from other view
			this.journeys = this._service.journeys();
			let query = this._service.query();
			this.origin = query.origin;
			this.destination = query.destination;
			this.date = query.date;
			this.ready = true;
			this.searchComplete = true;
		}
		else { // restore state from local storage on first load, if available
			this.restoreState('JourneyComponent')
				.then((state: ComponentState) => {
					if (state) {
						if (state.data()) {
							this.journeys = state.data();
							void this._service.journeys(<Array<Journey>>(state.data()));
						}
						if (state.query()) {
							this.date = state.query().date;
							this.destination = state.query().destination;
							this.origin = state.query().origin;
							void this._service.query(state.query());
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
	
	/** Finds journey options (if any) matching entries in journey search form */
	public onFindJourney(options: any) {
		this.origin = options.origin;
		this.destination = options.destination;
		this.date = options.date;
		this.searchInProgress = true;
		this.getJourneyList(this.origin, this.destination, this.date, true, false, true);
	}

	/** Flips flag that controls display of journey search form */
	public onChangeSearch() {
		this.searchInProgress = false;
		this.searchComplete = false;
		return false;
	}

	/** Resets view after error is acknowledged by user (in error-message component) */
	public onErrorOK() {
		this.error = this.searchComplete = this.searchInProgress = false;
	}

	// Navigates to journey details
	public onJourneySelected(journey: Journey) {
		if (journey instanceof Journey) {
			this._router.navigate(['/journey', journey.modelId()]);
		}
	}

	/** Stores the component's current state in local storage
	 * after clearing previous state from storage
	 */
	public storeState(): Promise<number> {
		let state: ComponentState = new ComponentState(
			'JourneyComponent',
			this.journeys,
			{
				date: this.date,
				destination: this.destination,
				origin: this.origin,
			}
		);
		return storage.clear()
			.then(() => {
				return state.writeObject(state, true);
			})
			.catch((e) => {
				console.log(e);
			});		
	}

	/** Retrieves and recreates the component's latest state from local storage */
	public restoreState(componentName: string): Promise<any> {
		// can't get mixin to work, so doing it manually for now
		return PersistableComponent_Defaults.prototype.restoreState.call(this, componentName);
	}
}

// Mix in default interface methods
applyMixins(JourneyComponent, [PersistableComponent_Defaults], false);