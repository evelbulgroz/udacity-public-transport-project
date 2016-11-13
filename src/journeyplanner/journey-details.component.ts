'use strict';

// imports
	import { Component} from '@angular/core'; // todo: remove input
	import { ActivatedRoute, Params} from '@angular/router';

	//import {ComponentState} from './../util/component-state.model'; // uncomment when implementing PersistableComponent
	import {Journey} from './../core/journey.model';
	import {JourneyService} from './journey.service';
	import {Leg} from './../core/Leg.model';
	//import {localStorage as storage} from './../app.module'; // uncomment when implementing PersistableComponent
	//import {PersistableComponent, PersistableComponent_Defaults} from './../persistable-component.interface'; // uncomment when implementing PersistableComponent
	import {StopTime} from './../core/stop-time.model';
	
	import moment from 'moment'; // works when transpiled to 'system' module format (in tsconfig.json)
	import tz from 'moment-timezone'; // only wanted for the side effects on main moment function
	void tz; // keep compiler happy
	
	import {htmlTemplate} from './journey-details.component.html'; // include template in compiled bundle; external html may cause extra http request 
	//import htmlTemplate: string from './journey-search.component.html'; // no need for ts literal when ts compiler catches up
	import {styles} from './journey-details.component.css'; // include template in compiled bundle; external html may cause extra http request 
	//import styles: string from './progress-indicator.component.html'; // no need for ts literal when ts compiler catches up


@Component({
	selector: 'public-transport-app-journey-details',
	template: htmlTemplate,
	//templateUrl: './journeyplanner/journey-search.component.html', // ngc compiler disagrees with dev module loader about path here, so using import instead
	styles: styles,
	//styleUrls: ['./journeyplanner/journey-search.component.css'],
	//viewProviders: [],
	//providers: []
})
/** @classdesc Displays journey details in the form of a list of Legs. */
export class JourneyDetailsComponent { //} implements PersistableComponent { // uncomment when implementing PersistableComponent
	public date: Date;
	public destination: StopTime = null;
	public journey: Journey = null;
	public origin: StopTime = null;
	public query: any = {}; // for use with PersistableComponent implementation
	
	public constructor(
		private _route: ActivatedRoute,
		private _service: JourneyService // provided in AppModule so master and detail can share same instance
		//private _router: Router
	) {}

	/** Gets and formats departure date for display in list header */
	public getDate(journey: Journey) {
		let date: Date = journey.legs()[0].origin().departureActual() || journey.legs()[0].origin().departurePlanned(); 
		return moment(date).format('ddd, MMM D, YYYY h:mm a');
	}
	
	/** Gets and formats departure time for display in list (using local Copenhagen time) */
	public getDepartureTime(leg: Leg) {
		let time: Date = leg.origin().departureActual() || leg.origin().departurePlanned();
		return moment(time).tz('Europe/Copenhagen').format('h:mm a');
	}
	
	/** Gets and formats journey duration for display in list */
	public getDuration(leg: Leg) {
		let departure = leg.origin().departureActual() || leg.origin().departurePlanned(),
		arrival = leg.destination().arrivalActual() || leg.destination().arrivalPlanned(),
		duration: any = moment.duration(arrival.valueOf() - departure.valueOf());
		if (duration.hours() === 0) { // less than one hour
			return duration.minutes() + ' min.';
		}
		else { // more than one hour
			return duration.hours() + ':' + (duration.minutes() < 10 ? '0' : '') + duration.minutes();
		}
		//return '1:23';
	}

	/** Gets and formats platform for display in list */
	public getPlatform(leg: Leg) {
		let platform: string = leg.origin().departureTrackActual() || leg.origin().departureTrackPlanned();
		return platform ? 'pl. ' + platform : '';
	}

	public ngOnInit() {
		let id: number;
		this._route.params.forEach((params: Params) => { // get id from url
			id = this.query.id = +params['id']; // (+) converts string 'id' to a number			
		});
		if (id !== undefined) {
			if (this._service.journeys().length > 0) { // assume we're called from active search in JourneyComponent 
				this.journey = this._service.getJourneyById(id) ? this._service.getJourneyById(id) : null;
				this.origin = this.query.origin = this.journey ? this.journey.legs()[0].origin(): null;
				this.date = this.query.date = this.origin ? this.origin.departureActual() || this.origin.departurePlanned() : null;
				this.destination = this.query.destination = this.journey ? this.journey.legs()[this.journey.legs().length -1].destination() : null;
				//void this.storeState(); // uncomment when implementing PersistableComponent
			}
			/* // uncomment when implementing PersistableComponent
			else { // restore state from local storage on first load, if available
					// in this case also restoring enough context in service to allow JourneyComponent to re-render if navigating back
				this.restoreState('JourneyDetailsComponent')
					.then((state: ComponentState) => {
						if (state) {
							if (state.data()) {
								void this._service.journeys(<Array<Journey>>(state.data()));
								if (state.query() && typeof state.query().id === 'number') {
									this.journey = this._service.getJourneyById(state.query().id);
								}
							}
							if (state.query()) {
								this.date = state.query().date;
								this.destination = state.query().destination;
								this.origin = state.query().origin;
								void this._service.query(
									{
										date: this.date,
										destination: this.destination,
										origin: this.origin
									}
								);
							}
						}
					})
					.catch((e) => {
						console.log(e);
					});	
			}
			*/
		}
	}

	/** Dummy implementation, currently provides no user-relevant functionality */
	public onLegSelected(leg: Leg): void {
		console.log(leg);
	}

	/** Stores the component's current state in local storage
	 * after clearing previous state from storage
	 */
	/* uncomment when implementing PersistableComponent
	public storeState(): Promise<number> {
		let state: ComponentState = new ComponentState(
			'JourneyDetailsComponent',
			this._service.journeys(),
			this.query
		);
		return storage.clear()
			.then(() => {
				return state.writeObject(state, true);
			})
			.catch((e) => {
				console.log(e);
			});		
	}
	*/

	/** Retrieves and recreates the component's latest state from local storage */
	/* uncomment when implementing PersistableComponent
	public restoreState(componentName: string): Promise<any> {
		// can't get mixin to work, so doing it manually for now
		return PersistableComponent_Defaults.prototype.restoreState.call(this, componentName);
	}
	*/
}
