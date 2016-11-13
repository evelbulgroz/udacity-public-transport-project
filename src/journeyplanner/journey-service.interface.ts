'use strict';

import {Leg} from './../core/leg.model';
import {Stop} from './../core/stop.model';

/** @classdescr Defines the contract for a journey planning service
 * Angular's dependency injection mechanism dislikes manual tampering with
 * the constructors of Injectables, so extending a base class is not an option
 */
export interface IJourneyService {
	/** Gets list of journeys matching origin/destination */
	fetchJourneyList(
		origin: Stop,
		destination: Stop,
		date: Date,
		useTrain: boolean,
		useBus: boolean,
		useMetro: boolean,
		via?: Stop): Promise<any>;

	fetchLaterJourneys(
		origin: Stop,
		destination: Stop,
		date: Date,
		useTrain: boolean,
		useBus: boolean,
		useMetro: boolean): Promise<any>;

	/** Gets journey details for a leg
	 * Note: Return value is not meaningful: use for side effect of adding detail to Leg data structure 
	 */
	fetchLegDetails(leg: Leg): Promise<any>;
}