'use strict';

import { Injectable } from '@angular/core';

import {preferences} from './../../../app.module';
import {ILocationService} from './../../../locationsearch/location-service.interface';
import {Place} from './../../../core/place.model';
import {RejseplanenPlace} from './../core/rejseplanen-place.model';
import {RejseplanenStop} from './../core/rejseplanen-stop.model';

declare const fetch: Function; // whatwg-fetch typings cause compiler errors, declare away the problem instead

@Injectable()
export class RejseplanenLocationService implements ILocationService {
	/** Fetches list of locations that match query from Rejseplanen.dk's location service
	 * Intended for injection into generic LocationService at construction,
	 * to only couple app loosely to any particular transit API
	 */
	public fetchLocations(query: string, useNonStops: boolean = false, useNonStations: boolean = false): Promise<any> {
		// Rejseplanen.dk API neither supports CORS nor jsonp, so resorting to CORS proxy for now 
		let url = preferences.proxyUrlPrefix +
				'xmlopen.rejseplanen.dk/bin/rest.exe/location?input='
				+ query
				+ '&format=json';
		return fetch(url)
			.then(function(response: Response) {
				if (response.ok) {
					return response.json();
				}
				else { // later, fall back on stored location list
					console.log('request failed');
					return {};
				}
			})
			.then(function(json: any) {
				// parse location JSON into array of Places
				let filteredLocations: Array<Place> = [];
				let createPlace = RejseplanenPlace.prototype.createProduct;
				let createStop = RejseplanenStop.prototype.createProduct;
				function parseList(list: any) { // helper function
					let exceptions: string[] = ['aarhus h', 'københavn h']; // legitimate stations that don't end in 'St.'
					let name: string;
					if (list.length) { // multiple locations/stops
						list.forEach(function(location: any) {
							name = location.name.toLowerCase();
							if (name.indexOf(query.toLowerCase()) > -1) {
								if (useNonStations || name.indexOf('st.') > -1 || exceptions.indexOf(name) > -1) {
									filteredLocations.push(
									location.type !== undefined
									? createPlace(location)  // only CoordLocations have type in response json
									: createStop(location) // else infer StopLocation
								);
								}
							}
						});
					}
					else { // single single location/stop
						filteredLocations.push(list.name);
					}	
				}
				// parse stop list, if any
				if (json.LocationList && json.LocationList.StopLocation) {
					parseList(json.LocationList.StopLocation);
				}
				// parse coordinates list, if any
				if (useNonStops && json.LocationList && json.LocationList.CoordLocation) {
					parseList(json.LocationList.CoordLocation);
				}
				// sort ascending by name
				return filteredLocations.sort(function(a:RejseplanenPlace, b:RejseplanenPlace) {
					if (a.name().toLowerCase() < b.name().toLowerCase()) {
						return -1;
					}
					else if (a.name().toLowerCase() > b.name().toLowerCase()) {
						return 1;
					}
					return 0;
				});
			})
			.catch(function(error: Error) {
				console.log(error);
				return {};
				//Promise.reject(error); // bubble up to caller
			})
	}
}