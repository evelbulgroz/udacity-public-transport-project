'use strict';

import { Injectable, ReflectiveInjector } from '@angular/core';

import {classMap} from './../app.module'; // import as references so the details aren't needed here
import {ILocationService} from './location-service.interface';

/**@classdesc Manages calls for location (station/stop) related data from core classes/components.
 * Encapsulates concrete API location service so core classes need not know about it. 
 * Operates exclusively on core models in order to otherwise decouple from any concrete transit API.
*/
@Injectable()
export class LocationService implements ILocationService {
	private _service: ILocationService;

	public constructor() {
		// apiServices import is undefined when standard DI runs, so go manual: 
		//this._service = (ReflectiveInjector.resolveAndCreate([apiReferences.location])).get(apiReferences.location);
		this._service = (ReflectiveInjector.resolveAndCreate([classMap.services.apiLocationService])).get(classMap.services.apiLocationService);
	}

	/** Gets list of locations that match query from injected transit API's location service
	 * @return {Array} String Array
	 */
	public fetchLocations(query: string, useNonStops: boolean = false): Promise<any> {
		return this._service.fetchLocations(query, useNonStops)
			.then(function(result: any){
				return result;
			})
			.catch(function(e: any) {
				console.log(e);
			});
	}
}