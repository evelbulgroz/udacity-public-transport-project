'use strict';

import {Stop} from './../core/stop.model';
import {Trip} from './../core/trip.model';

/** @classdescr Defines the contract for a departure service
 * Angular's dependency injection mechanism dislikes manual tampering with
 * the constructors of Injectables, so extending a base class is not an option
 */
export interface IDepartureService {
	fetchDepartures(stop: Stop, date: Date, useTrain: boolean, useBus: boolean, useMetro: boolean): Promise<any>;
	fetchDepartureDetails(departure: Trip): Promise<Trip>
}