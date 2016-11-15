'use strict';

import { Injectable, ReflectiveInjector } from '@angular/core';

import {classMap} from './../app.module'; // import as references so the details aren't needed here 
import {IArrivalService} from './../arrivals/arrival-service.interface';
import {Stop} from './../core/stop.model';
import {Trip} from './../core/trip.model';

/**@classdesc Manages calls for arrivals related data from core classes/components.
 * Encapsulates concrete API arrival service so core classes need not know about it. 
 * Operates exclusively on core models in order to otherwise decouple from any concrete transit API.
*/
@Injectable()
export class ArrivalService implements IArrivalService {
	private _arrivals: Array<Trip> = []; // stores results of most recent arrivals search
	private _query: any = {}; // stores query params of most recent arrivals search
	private _service: IArrivalService;
	
	public constructor() {
		// apiServices import is undefined when standard DI runs, so go manual: 
		//this._service = (ReflectiveInjector.resolveAndCreate([apiReferences.arrival])).get(apiReferences.arrival);
		this._service = (ReflectiveInjector.resolveAndCreate([classMap.services.apiArrivalService])).get(classMap.services.apiArrivalService);
	}

	/** Gets results of most recent search, or sets arrivals collection after restoring component state */
	public arrivals(arrivalsarrivals: Array<Trip>): Array<Trip>;
	public arrivals(): Array<Trip>;
	public arrivals(): Array<Trip> {
		if (arguments[0] && arguments[0] instanceof Trip) {
			this._arrivals = arguments[0];
		}
		return this._arrivals;
	}
	
	/** Gets item from current arrivals collection by model id */
	public getArrivalById(modelId: number): Trip {
		return this._arrivals.find((arrival: Trip): boolean => arrival.modelId() === modelId);
	}

	/** Fetches list of arrivals at stop from injected transit API's arrivals service */
	public fetchArrivals(stop: Stop, date: Date, useTrain: boolean = true, useBus: boolean = false, useMetro: boolean = false): Promise<Array<Trip>> {
		let self = this;
		this._query = {stop: stop, date: date, useTrain: useTrain, useBus: useBus, useMetro: useMetro};
		return this._service.fetchArrivals(stop, date, useTrain, useBus, useMetro)
			.then((arrivals: Array<Trip>) => {
				self._arrivals = arrivals;
				return Promise.resolve(arrivals);
			})
			.catch((e: Error) => { // report error, then bubble up to caller
				console.log(e);
				return Promise.reject(e);
			})
	}

	/** Fetches arrival details from injected transit API's arrival detail service */
	public fetchArrivalDetails(arrival: Trip): Promise<Trip> {
		return this._service.fetchArrivalDetails(arrival)
			.then((arrival: Trip) => {
				return Promise.resolve(arrival);
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