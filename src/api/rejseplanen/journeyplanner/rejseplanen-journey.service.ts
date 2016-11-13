'use strict';

import {Injectable} from '@angular/core';

import {IJourneyService} from './../../../journeyplanner/journey-service.interface';
import {LatLng} from './../../../core/latlng.model';
import {preferences} from './../../../app.module';
import {RejseplanenAgency} from './../core/rejseplanen-agency.model';
import {RejseplanenFactory} from './../core/rejseplanen-factory.model';
import {RejseplanenJourney} from './../core/rejseplanen-journey.model';
import {RejseplanenLeg} from './../core/rejseplanen-leg.model';
import {RejseplanenRoute} from './../core/rejseplanen-route.model';
import {RejseplanenTrip} from './../core/rejseplanen-trip.model';
import {Stop} from './../../../core/stop.model';
import {StopTime} from './../../../core/stop-time.model';
import {Trip} from './../../../core/trip.model';

declare const fetch: Function; // whatwg-fetch typings cause compiler errors, declare away the problem instead

@Injectable()
export class RejseplanenJourneyService implements IJourneyService {
	private _journeys: Array<RejseplanenJourney> = [];
	
	// consolidates routes and stops across a collection of journeys
	private _dedupe(journeys: Array<RejseplanenJourney>): void {
		let routes: any = {};
		let stops: any = {};
		let duplicates: Array<any> = [];
		let route: RejseplanenRoute;
		function _doDedupe(stopTime: StopTime) {
			// dedupe routes
				route = <RejseplanenRoute>stopTime.trip().route();
				if (routes[route.name()] && route.modelId() !== routes[route.name()].modelId()) { // dedupe
					route.trips().forEach((trip: RejseplanenTrip) => { // migrate trips
						void routes[route.name()].addTrip(trip); // also updates route reference in trip
					})
					void duplicates.push(route)// remember duplicate for later deletion
					void stopTime.trip().route(routes[route.name()]); // overwrite duplicate
				}
				else { // add route to map
					routes[route.name()] = route;
				}
			
			// dedupe stops
				let stop: Stop = stopTime.stop();
				if (stop && stops[stop.name()]) {
					void duplicates.push(stop);
					void stopTime.stop(stops[stop.name()]);
				}
				else {
					stops[stop.name()] = stop;
				}
		}
		// iterate through journeys
		journeys.forEach((journey: RejseplanenJourney) => {
			journey.legs().forEach((leg: RejseplanenLeg) => {
				_doDedupe(leg.origin());
				_doDedupe(leg.destination());
			})
		});
		// free up references to duplicates (may be unnecesary)
		for (let key in routes) {delete routes[key];}
		for (let key in stops) {delete stops[key];}
		
		// delete duplicates to enable garbage collection
		while (duplicates.length) {delete duplicates.pop();}
	};
	
	/** Fetches list of journeys matching origin/destination from Rejseplanen.dk's trip service */
	public fetchJourneyList(
		origin: Stop,
		destination: Stop,
		date: Date,
		useTrain: boolean,
		useBus: boolean,
		useMetro: boolean
		//via?: Stop
		): Promise<any> {
		this._dedupe([]); // cheat TS compiler (cannot see call inside fetch callback)
		// Rejseplanen.dk API neither supports CORS nor jsonp, so resorting to CORS proxy for now
		let url = preferences.proxyUrlPrefix +
				'xmlopen.rejseplanen.dk/bin/rest.exe/trip?'
				+ 'originId=' + origin.apiId()
				+ '&destId=' + destination.apiId()
				+ '&date=' + RejseplanenFactory.getAPIDate(date)
				+ '&time=' + RejseplanenFactory.getAPITime(date)
				+ 'useTog=' + Number(useTrain)
				+ '&useBus=' + Number(useBus)
				+ '&useMetro=' + Number(useMetro)
				+ '&format=json';
		let self: any = this;
		return fetch(url)
			.then((response: Response) => {
				if (response.ok) {
					return response.json();
				}
				else {
					// later, handle error more elegantly
					return undefined;
				}
			})
			.then(function(json: any) {
				// helper function
				let agencies: any = {}; // declare here to allow consolidation across journeys
				function _parseJourney(json: any): RejseplanenJourney {
					let agency: RejseplanenAgency;
					let createAgency: Function = RejseplanenAgency.prototype.createProduct
					let createLeg: Function = RejseplanenLeg.prototype.createProduct;
					let leg: RejseplanenLeg;
					let journey = new RejseplanenJourney();
					let route: any;
					if (json && json.Leg) { // search yielded result
						let legs = json.Leg;
						if (legs.length) { // multiple legs
							legs.forEach((leg_json: any) => {
								leg = createLeg(leg_json);
								void journey.legs().push(leg);
								agency = createAgency(leg_json);
								route = leg.trip().route();
								if (agency && route) {
									if (agencies[agency.name()] === undefined) {
										agencies[agency.name()] = agency;
									}
									else { // discard duplicates
										agency = agencies[agency.name()]
									}
									agency.addRoute(route);
								}
							})
						}
						else { // single leg
							leg = createLeg(legs);
							void journey.legs().push(leg);
							agency = createAgency(legs);
							route = leg.trip().route();
							if (agency && route) {agency.addRoute(route);}
						}
					}
					return journey;
				}

				// parse JSON into array of Journeys
				let journeys: Array<RejseplanenJourney> = [];
				if (json.TripList && json.TripList.Trip) { // service returned TripList
					if (json.TripList.Trip.length) { // serviced returned multiple trip options 
						json.TripList.Trip.forEach((journey: Object) => {
							journeys.push(_parseJourney(journey));
						});
					// assume journeys are correctly sorted in json, else sort here
					}
					else if (json.Trip) { // service returned single trip
						journeys.push(_parseJourney(json.TripList.Trip));
					}
				}
				else {
					// handle error
				}

				self._dedupe(journeys);
				self._journeys = journeys;
				return Promise.resolve(journeys);
			})
			.catch(function(e: any) {
				return Promise.reject(e);
			})
	}
	
	/** Fetches list of journeys starting just after the supplied date */
	public fetchLaterJourneys(
		origin: Stop,
		destination: Stop,
		date: Date,
		useTrain: boolean,
		useBus: boolean,
		useMetro: boolean
	): Promise<any>{
		let allJourneys = this._journeys.slice(); // get a clone of the existing journey list
		return this.fetchJourneyList(
			origin,
			destination,
			new Date(date.valueOf() + 60 * 1000), // 60 sec offset
			useTrain,
			useBus,
			useMetro
		)
			.then((newJourneys: Array<RejseplanenJourney>) => {
				allJourneys = allJourneys.concat(newJourneys);
				this._dedupe(allJourneys); // dedupe across existing and added journeys
				this._journeys = allJourneys;
				return Promise.resolve(newJourneys);
			})
			.catch((e) => {
				return Promise.reject(e);
			});
	}

	/** Gets details for a leg on a journey and adds them to leg
	 * Note: Return value is not meaningful: use for side effect of adding detail to Leg data structure 
	 */
	public fetchLegDetails(leg: RejseplanenLeg): Promise<any> {
		// Rejseplanen.dk API neither supports CORS nor jsonp, so resorting to CORS proxy for now.
		let url = leg.detailsUrl() ? preferences.proxyUrlPrefix + leg.detailsUrl().split('//')[1]: undefined;
		if (!url) {return new Promise((resolve) => {resolve()})} // Return empty Promise if leg has no detailsURL
		return fetch(url)
			.then((response: Response): any => {
				if (response.ok) {
					return response.json();
				}
				else {
					// later, actually handle error
					return undefined;
				}
			})
			.then((json: any): Promise<RejseplanenLeg> => { // parse API JSON into generic transit object model 
				if (json) {
				// parse Trip(s)
					// Note: Service may return multiple trips that don't require change to a different carriage.
						// These are collapsed into a single trip, using the details of the first trip in the list;
						// this matches how Rejseplanen's own Web UI and app work.
					let trip: Trip = leg.trip() ? leg.trip() : leg.origin().trip(new RejseplanenTrip(undefined, undefined, false));
					let tripName: string = json.JourneyDetail.JourneyName.length ? json.JourneyDetail.JourneyName[0].name : json.JourneyDetail.JourneyName.name;
					let tripType: string = json.JourneyDetail.JourneyType.length ? json.JourneyDetail.JourneyType[0].type : json.JourneyDetail.JourneyType.type;
					tripType = tripName.toLowerCase() === 're' && tripType.toLowerCase() === 'tog' ? 'REG' : tripType; // api service wrongly designates some REG trains as TOG
					tripName = ['ic', 'icl', 'lyn', 'reg'].indexOf(tripType.toLowerCase()) > -1 ? tripName : undefined; // only main rail services have meaningful trip names
					void trip.name(tripName);
				// parse Stop(Time)s
					let stopTime: StopTime;
					while (trip.stopTimes().length > 0) {void trip.stopTimes().pop()} // clear out duplicates
					json.JourneyDetail.Stop.forEach((json: any) => {	
						stopTime = new StopTime(
							undefined,
							undefined,
							json.depDate && json.depTime ? RejseplanenFactory.parseAPIDate(json.depDate, json.depTime) : undefined,
							undefined,
							json.track
						);
						stopTime.stop(new Stop(
							undefined,
							json.name,
							new LatLng(parseInt(json.x)/1000000, parseInt(json.y)/1000000)
						))
						void trip.addStopTime(stopTime);
					});
				// parse messages
					if (json.JourneyDetail.MessageList) { // service returned one or more messages
						while (leg.messages().length > 0) {void leg.messages().pop()} // clear out duplicates
						if (json.JourneyDetail.MessageList.Message.length) { // multiple messages
							json.JourneyDetail.MessageList.Message.forEach((message: any) => {
								leg.addMessage(RejseplanenFactory.parseAPImessage(message));
								//_parseMessage(message);
							});
						}
						else { // single message
							leg.addMessage(RejseplanenFactory.parseAPImessage(json.JourneyDetail.MessageList.Message));
							//_parseMessage(json.JourneyDetail.MessageList.Message);
						}
					}
				// parse notes
					if (json.JourneyDetail.Note) { // service returned one or more notes
						while (leg.notes().length > 0) {void leg.notes().pop()} // clear out duplicates
						if (json.JourneyDetail.Note.length) { // multiple notes
							json.JourneyDetail.Note.forEach((note: any) => {
								leg.addNote(RejseplanenFactory.parseAPInote(note));
								//_parseNote(note);
							});
						}
						else { // single note
							leg.addNote(RejseplanenFactory.parseAPInote(json.JourneyDetail.Note));
							//_parseNote(json.JourneyDetail.Note);
						}
					}
				
				}
				return Promise.resolve(leg);
			})
			.catch((e: any) => {
				console.log(e);
				throw e; // bubble error up to caller
			})
	}
}