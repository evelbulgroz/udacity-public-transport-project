'use strict';

import { Injectable, ReflectiveInjector } from '@angular/core';

import {classMap} from './../app.module';  // import as references so the details aren't needed here
import {IJourneyService} from './journey-service.interface';
import {Journey} from './../core/journey.model';
import {Leg} from './../core/leg.model';
import {Stop} from './../core/stop.model';
//import {StopTime} from './../core/stop-time.model';

@Injectable()
export class JourneyService implements IJourneyService{
	private _journeys: Array<Journey> = []; // stores results of most recent journey search
	private _query: any = {};  // stores query params of most recent journey search
	private _service: IJourneyService;
	
	public constructor() {
		// apiServices import is undefined when standard DI runs, so go manual: 
		//this._service = (ReflectiveInjector.resolveAndCreate([apiReferences.journey])).get(apiReferences.journey);
		this._service = (ReflectiveInjector.resolveAndCreate([classMap.services.apiJourneyService])).get(classMap.services.apiJourneyService);
	}

	/** Gets item from current journey collection by model id */
	public getJourneyById(modelId: number): Journey {
		return this._journeys.find((journey: Journey): boolean => journey.modelId() === modelId);
	}

	/** Gets results of most recent search, or sets journey collection after restoring component state */
	public journeys(journeys: Array<Journey>): Array<Journey>;
	public journeys(): Array<Journey>;
	public journeys(): Array<Journey> {
		if (arguments[0] && arguments[0][0] instanceof Journey) {
			this._journeys = arguments[0];
		}
		return this._journeys;
	}
			
	/** Gets list of journeys matching origin/destination from injected transit API's journey search service */
	public fetchJourneyList(
		origin: Stop,
		destination: Stop,
		date: Date,
		useTrain: boolean,
		useBus: boolean,
		useMetro: boolean,
		via?: Stop): Promise<any> {
			let self = this;
			this._query = {origin: origin, destination: destination, date: date, useTrain: useTrain, useBus: useBus, useMetro: useMetro, via: via};
			return this._service.fetchJourneyList(origin, destination, date, useTrain, useBus, useMetro, via)
				.then(function(result: any) {
					self._journeys = result;
					return result;
				})
				.catch(function(e: Error) {
					console.log(e);
					throw e; // bubble error up to caller
				})
	}

	/** Gets list of additional journeys starting just after the last of the current set of journeys
	 * - otherwise reusing the query parameters from the most recent journey search 
	 */
	public fetchLaterJourneys(origin: Stop, destination: Stop, date: Date, useTrain: boolean, useBus: boolean, useMetro: boolean, journeys?: Journey[]): Promise<any> {
		// clone collection from component if app was just reloaded and restored from local storage
		// (in which case service's collection will be empty)   
		if (journeys && this._journeys.length === 0) {
			this._journeys = journeys.slice();
		}
		return this._service.fetchLaterJourneys(
			origin,
			destination,
			date,
			useTrain,
			useBus,
			useMetro
		)
			.then((laterJourneys: Array<Journey>) => {
				this._journeys = this._journeys.concat(laterJourneys);
				return Promise.resolve(laterJourneys);
			})
			.catch((e) => {
				return Promise.reject(e);
			});
	}

	/** Gets journey details for a leg from injected transit API's journey detail service */
	public fetchLegDetails(leg: Leg): Promise<any> {
		return this._service.fetchLegDetails(leg)
			.then((result: any) => {
				return result;
			})
			.catch((e: Error) => {
				console.log(e);
				throw e; // bubble error up to caller
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