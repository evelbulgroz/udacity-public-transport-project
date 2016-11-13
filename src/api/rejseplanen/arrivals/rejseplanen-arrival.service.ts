'use strict';

import { Injectable } from '@angular/core';

import {IArrivalService} from './../../../arrivals/arrival-service.interface';
import {LatLng} from './../../../core/latlng.model';
import {Note} from './../../../core/note.interface';
import {preferences} from './../../../app.module';
import {RejseplanenAgency} from './../core/rejseplanen-agency.model';
import {RejseplanenFactory} from './../core/rejseplanen-factory.model';
import {RejseplanenRoute} from './../core/rejseplanen-route.model';
import {RejseplanenStop} from './../core/rejseplanen-stop.model';
import {RejseplanenTrip} from './../core/rejseplanen-trip.model';
import {StopTime} from './../../../core/stop-time.model';

declare const fetch: Function; // whatwg-fetch typings cause compiler errors, declare away the problem instead
		
@Injectable()
export class RejseplanenArrivalService implements IArrivalService {
	/** Gets list of arrivals at stop from Rejseplanen.dk's stationboard service
	 * @return {Promise}
	 */
	public fetchArrivals(stop: RejseplanenStop, date: Date, useTrain: boolean = true, useBus: boolean = false, useMetro: boolean = false): Promise<any> {
		// Rejseplanen.dk API neither supports CORS nor jsonp, so resorting to CORS proxy for now 
		let url = preferences.proxyUrlPrefix + 
				'xmlopen.rejseplanen.dk/bin/rest.exe/arrivalBoard?'
				//let url = 'http://xmlopen.rejseplanen.dk/bin/rest.exe/arrivalBoard?'
				+ 'id=' + stop.apiId()
				+ '&date=' + RejseplanenFactory.getAPIDate(date)
				+ '&time=' + RejseplanenFactory.getAPITime(date)
				+ '&useTog=' + Number(useTrain)
				+ '&useBus=' + Number(useBus)
				+ '&useMetro=' + Number(useMetro)
				+ '&format=json';
		return fetch(url)
			.then((response: any) => {
				if (response.ok) {
					return response.json();
				}
				else { 
					// later, actually handle error
					return response;
				}
			})
			.then(function(json: any) {
				let agency: RejseplanenAgency;
				let agencies: any = {};
				let origin: RejseplanenStop;
				let route: RejseplanenRoute;
				let routes: {[key:string]: RejseplanenRoute} = {};
				let trip: RejseplanenTrip;
				let trips: RejseplanenTrip[] = [];
				let stop: RejseplanenStop;
				let stops: {[key:string]: RejseplanenStop} = {};
				//let stopTimes: {[key:string]: StopTime} = {};
				let stopTime: StopTime;
				
				function _parseArrival(arrival: any): RejseplanenTrip {
					// parse agency, avoiding duplication
						agency = RejseplanenAgency.prototype.createProduct(arrival);
						if (agency) {
							if (agencies[agency.name()] === undefined) {
								agencies[agency.name()] = agency;
							}
							else { // discard duplicates
								agency = agencies[agency.name()]
							}
						}
					
					// parse route, adding agency
						route = routes[arrival.name] 
						if (route === undefined) {
							route = RejseplanenRoute.prototype.createProduct(arrival);
							routes[arrival.name] = route;
						}
						if (route && agency) {
							let exists: boolean = false;
							agency.routes().forEach(rt => {
								exists = rt.name() === route.name() ? true : exists;
							})
							if (!exists) {agency.addRoute(route)};
						}
												
					// parse trip (including origin)
						trip = new RejseplanenTrip(undefined, undefined, false, undefined, undefined, arrival.JourneyDetailRef.ref);
						origin = new RejseplanenStop('', arrival.origin, undefined);
						stopTime = new StopTime('', undefined, new Date(0), undefined);
						void stopTime.stop(origin);
						trip.addStopTime(stopTime);
						route.addTrip(trip);
												
					// parse stop for arrival location, avoiding duplication
						stop = stops[arrival.stop];
						if (stop === undefined) {
							stop = new RejseplanenStop('', arrival.stop, undefined);
							stops[arrival.name] = stop;
						}
					
					// parse stoptime for arrival location
						stopTime = new StopTime(
							'',
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							arrival.date ? RejseplanenFactory.parseAPIDate(arrival.date, arrival.time) : undefined,
							arrival.rtDate ? RejseplanenFactory.parseAPIDate(arrival.rtDate, arrival.rtTime) : undefined,
							arrival.track,
							arrival.rtTrack
						);
						void stopTime.stop(stop);
						void trip.addStopTime(stopTime);
						
					return trip;
				}
				
				if (json.ArrivalBoard && json.ArrivalBoard.Arrival) { // service returned arrival(s)
					if (json.ArrivalBoard.Arrival.length) { // multiple arrivals 
						json.ArrivalBoard.Arrival.forEach((arrival: any) => {
							void trips.push(_parseArrival(arrival));
						})
					}
					else if (json.ArrivalBoard.Arrival) { // single arrival
						void trips.push(_parseArrival(json.ArrivalBoard.Arrival));
					}
				}
				return trips;
			})
			.catch(function(e: Error) {
				console.log(e);
				throw e; // bubble error up to caller
			})
	}

	/** Gets details for a arrival and adds them to arrival
	 * Note: Parsing of API json JourneyName/Type arrays not currently implemented
	 */
	public fetchArrivalDetails(arrival: RejseplanenTrip): Promise<RejseplanenTrip> {
		// Rejseplanen.dk API neither supports CORS nor jsonp, so resorting to CORS proxy for now.
		let url = arrival.detailsUrl() ? preferences.proxyUrlPrefix + arrival.detailsUrl().split('//')[1]: undefined;
		if (!url) {return Promise.resolve(undefined)} // Return empty Promise if leg has no detailsURL
		return fetch(url)
			.then((response: Response): any => {
				if (response.ok) {
					return response.json();
				}
				else {
					return undefined;
				}
			})
			.then((json: any) => { // parse API json into arrival
				if (json && json.JourneyDetail) {
					if (json.JourneyDetail.Stop && json.JourneyDetail.Stop.length) { // parse stops
						let stopTimes: Array<StopTime> = [];
						json.JourneyDetail.Stop.forEach((json: any, ix: number) => {
							let stop: RejseplanenStop = new RejseplanenStop(
								undefined,
								json.name,
								new LatLng(parseInt(json.x)/1000000, parseInt(json.y)/1000000),
								false
							);
							let departureDate: Date = json.depDate && json.depTime? RejseplanenFactory.parseAPIDate(json.depDate, json.depTime) : undefined;
							let arrivalDate: Date = json.arrDate && json.arrTime ? RejseplanenFactory.parseAPIDate(json.arrDate, json.arrTime) : undefined;
							let stopTime: StopTime = new StopTime(
								undefined,
								parseInt(json.routeIdx),
								departureDate,
								json.rtDepDate && json.rtDepTime? RejseplanenFactory.parseAPIDate(json.rtDepDate, json.rtDepTime) : undefined,
								departureDate !== undefined ? json.track : departureDate === undefined && arrivalDate === undefined ? json.track : undefined,
								undefined,
								arrivalDate,
								json.rtArrDate && json.rtArrTime? RejseplanenFactory.parseAPIDate(json.rtArrDate, json.rtArrTime) : undefined,
								arrivalDate !== undefined ? json.track : departureDate === undefined && arrivalDate === undefined ? json.track : undefined
							);
							void stopTime.stop(stop);
							void stopTime.trip(arrival);
							stopTimes[ix] = stopTime;
						});
						while (arrival.stopTimes().pop()) {} // update arrival
						stopTimes.forEach((stopTime: StopTime) => {void arrival.stopTimes().push(stopTime);});
					}
					if (json.JourneyDetail.Note && json.JourneyDetail.Note.length) { // parse notes
						let notes: Array<Note> = [];
						json.JourneyDetail.Note.forEach((json: any) => {
							void notes.push(RejseplanenFactory.parseAPInote(json));
						});
						while (arrival.notes().pop()) {} // update arrival
						notes.forEach((note: Note) => {void arrival.addNote(note);});
					}
				}
				return Promise.resolve(arrival);
			})
			.catch((e: any) => {
				console.log(e);
				Promise.reject(e);
			})
	}
}