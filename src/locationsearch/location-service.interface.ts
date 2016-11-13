'use strict';

/** @classdescr Defines the contract for a location service
 * Angular's dependency injection mechanism dislikes manual tampering with
 * the constructors of Injectables, so extending a base class is not an option
 */
export interface ILocationService {
	fetchLocations(query: string, useNonStops: boolean): any;	
}