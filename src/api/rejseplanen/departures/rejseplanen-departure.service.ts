'use strict';

import { Injectable } from '@angular/core';

import {IDepartureService} from './../../../departures/departure-service.interface';
import {LatLng} from './../../../core/latlng.model';
import {Note} from './../../../core/note.interface';
import {preferences} from './../../../app.module';
import {RejseplanenAgency} from './../core/rejseplanen-agency.model';
import {RejseplanenFactory} from './../core/rejseplanen-factory.model';
import {RejseplanenRoute} from './../core/rejseplanen-route.model';
import {RejseplanenStop} from './../core/rejseplanen-stop.model';
import {RejseplanenTrip} from './../core/rejseplanen-trip.model';
import {Stop} from './../../../core/stop.model';
import {StopTime} from './../../../core/stop-time.model';

declare const fetch: Function; // whatwg-fetch typings cause compiler errors, declare away the problem instead

@Injectable()
export class RejseplanenDepartureService implements IDepartureService {
	/** Gets list of departures at stop from Rejseplanen.dk's stationboard service */
	public fetchDepartures(stop: Stop, date: Date, useTrain: boolean = true, useBus: boolean = false, useMetro: boolean = false): Promise<any> {
		// Rejseplanen.dk API neither supports CORS nor jsonp, so resorting to CORS proxy for now 
		let url = preferences.proxyUrlPrefix +
				'xmlopen.rejseplanen.dk/bin/rest.exe/departureBoard?'
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
				let finalStop: RejseplanenStop;
				let route: RejseplanenRoute;
				let routes: {[key:string]: RejseplanenRoute} = {};
				let trip: RejseplanenTrip;
				let trips: RejseplanenTrip[] = [];
				let stop: RejseplanenStop;
				let stops: {[key:string]: RejseplanenStop} = {};
				//let stopTimes: {[key:string]: StopTime} = {};
				let stopTime: StopTime;
				
				function _parseDeparture(departure: any): RejseplanenTrip {
					// parse agency, add to collection unless already there
					agency = RejseplanenAgency.prototype.createProduct(departure);
					if (agency) {
						if (agencies[agency.name()] === undefined) {
							agencies[agency.name()] = agency;
						}
						else { // discard duplicates
							agency = agencies[agency.name()]
						}
					}
					
					// parse route
					route = routes[departure.name] 
					if (route === undefined) {
						route = RejseplanenRoute.prototype.createProduct(departure);
						routes[departure.name] = route;
					}
					if (route && agency) {
						let exists: boolean = false;
						agency.routes().forEach(rt => {
							exists = rt.name() === route.name() ? true : exists;
						})
						if (!exists) {agency.addRoute(route)};
					}
												
					// parse trip
					trip = new RejseplanenTrip('', '', false, undefined, undefined, departure.JourneyDetailRef.ref);
					route.addTrip(trip);
												
					// parse stop
					stop = stops[departure.stop];
					if (stop === undefined) {
						stop = new RejseplanenStop('', departure.stop, undefined);
						stops[departure.name] = stop;
					}
					
					// parse stoptime
					stopTime = new StopTime(
						'',
						undefined,
						departure.date ? RejseplanenFactory.parseAPIDate(departure.date, departure.time) : undefined,
						departure.rtDate ? RejseplanenFactory.parseAPIDate(departure.rtDate, departure.rtTime) : undefined,
						departure.track,
						departure.rtTrack
					);
					void stopTime.stop(stop);
					void trip.addStopTime(stopTime);

					// parse destination
					stopTime = new StopTime('', undefined, undefined);
					finalStop = new RejseplanenStop('', departure.finalStop, undefined);
					void stopTime.stop(finalStop);
					trip.addStopTime(stopTime);
					
					return trip;
				}
				
				if (json.DepartureBoard && json.DepartureBoard.Departure) { // service returned departure(s)
					if (json.DepartureBoard.Departure.length) { // multiple departures 
						json.DepartureBoard.Departure.forEach((departure: any) => {
							void trips.push(_parseDeparture(departure));
						})
					}
					else if (json.departureBoard.departure) { // single departure
						void trips.push(_parseDeparture(json.DepartureBoard.Departure));
					}
				}
				return trips;
			})
			.catch(function(e: Error) {
				console.log(e);
				throw e; // bubble error up to caller
			})
	}

	/** Gets details for a departure and adds them to departure
	 * Note: Parsing of API json JourneyName/Type arrays not currently implemented
	 */
	public fetchDepartureDetails(departure: RejseplanenTrip): Promise<RejseplanenTrip> {
		// Rejseplanen.dk API neither supports CORS nor jsonp, so resorting to CORS proxy for now.
		let url = departure.detailsUrl() ? preferences.proxyUrlPrefix + departure.detailsUrl().split('//')[1]: undefined;
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
							let departure: Date = json.depDate && json.depTime? RejseplanenFactory.parseAPIDate(json.depDate, json.depTime) : undefined;
							let arrival: Date = json.arrDate && json.arrTime ? RejseplanenFactory.parseAPIDate(json.arrDate, json.arrTime) : undefined;
							let stopTime: StopTime = new StopTime(
								undefined,
								parseInt(json.routeIdx),
								departure,
								json.rtDepDate && json.rtDepTime? RejseplanenFactory.parseAPIDate(json.rtDepDate, json.rtDepTime) : undefined,
								departure !== undefined ? json.track : departure === undefined && arrival === undefined ? json.track : undefined,
								undefined,
								arrival,
								json.rtArrDate && json.rtArrTime? RejseplanenFactory.parseAPIDate(json.rtArrDate, json.rtArrTime) : undefined,
								arrival !== undefined ? json.track : departure === undefined && arrival === undefined ? json.track : undefined
							);
							void stopTime.stop(stop);
							stopTimes[ix] = stopTime;
						});
						while (departure.stopTimes().pop()) {} // update arrival
						stopTimes.forEach((stopTime: StopTime) => {void departure.addStopTime(stopTime);});
					}
					if (json.JourneyDetail.Note && json.JourneyDetail.Note.length) { // parse notes
						let notes: Array<Note> = [];
						json.JourneyDetail.Note.forEach((json: any) => {
							void notes.push(RejseplanenFactory.parseAPInote(json));
						});
						while (departure.notes().pop()) {} // update arrival
						notes.forEach((note: Note) => {void departure.addNote(note);});
					}
				}
				return Promise.resolve(departure);
			})
			.catch((e: any) => {
				console.log(e);
				Promise.reject(e);
			})
	}
}