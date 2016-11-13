'use strict';

import { Injectable, ReflectiveInjector } from '@angular/core';

import {classMap} from './../app.module';  // import as references so the details aren't needed here
import {IDepartureService} from './departure-service.interface';
import {Stop} from './../core/stop.model';
import {Trip} from './../core/trip.model';

@Injectable() // can't figure out how to insert provider here, so doing it in calling component for now
export class DepartureService implements IDepartureService{
	private _departures: Array<Trip> = []; // stores results of most recent arrivals search
	private _query: any = {}; // stores query params of most recent arrivals search
	private _service: IDepartureService;

	public constructor() {
		// apiServices import is undefined when standard DI runs, so go manual: 
		//this._service = (ReflectiveInjector.resolveAndCreate([apiReferences.departure])).get(apiReferences.departure);
		this._service = (ReflectiveInjector.resolveAndCreate([classMap.services.apiDepartureService])).get(classMap.services.apiDepartureService);
	}

	/** Gets results of most recent search, or sets departures collection after restoring component state */
	public arrivals(arrivalsarrivals: Array<Trip>): Array<Trip>;
	public arrivals(): Array<Trip>;
	public arrivals(): Array<Trip> {
		if (arguments[0] && arguments[0] instanceof Trip) {
			this._departures = arguments[0];
		}
		return this._departures;
	}
	
	/** Gets item from current arrivals collection by model id */
	public getDepartureById(modelId: number): Trip {
		return this._departures.find((departure: Trip): boolean => departure.modelId() === modelId);
	}

	/** Fetches list of departures at stop from from injected transit API's departures service */
	public fetchDepartures(stop: Stop, date: Date, useTrain: boolean = true, useBus: boolean = false, useMetro: boolean = false): Promise<any> {
		let self = this;
		this._query = {stop: stop, date: date, useTrain: useTrain, useBus: useBus, useMetro: useMetro};
		return this._service.fetchDepartures(stop, date, useTrain, useBus, useMetro)
			.then(function(departures: Array<Trip>) {
				self._departures = departures;
				return Promise.resolve(departures);
			})
			.catch(function(e: Error) {
				console.log(e);
				throw e; // bubble error up to caller
			})
	}

	/** Gets arrival details from injected transit API's arrival detail service */
	public fetchDepartureDetails(departure: Trip): Promise<Trip> {
		return this._service.fetchDepartureDetails(departure)
			.then((result: any) => {
				return Promise.resolve(result);
			})
			.catch((e: Error) => {
				console.log(e);
				return Promise.reject(e); // bubble error up to caller
			})
	}

	/** Gets query parameters for most recent search,  or sets query after restoring component state  */
	public query(query: any): any; // later maybe add a query interface so ensure type safety
	public query(): any;
	public query(): any {
		if (arguments[0]) {
			this._query = arguments[0];
		}
		return this._query;
	}
}