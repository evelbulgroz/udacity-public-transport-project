'use strict';

import {Stop} from './../core/stop.model';
import {Trip} from './../core/trip.model';

/** @classdescr Defines the contract for an arrival service
 * Angular's dependency injection mechanism dislikes manual tampering with
 * the constructors of Injectables, so extending a base class is not an option
 */
export interface IArrivalService {
	fetchArrivals(stop: Stop, date: Date, useTrain: boolean, useBus: boolean , useMetro: boolean): Promise<any>;
	fetchArrivalDetails(arrival: Trip): Promise<any>	
}
