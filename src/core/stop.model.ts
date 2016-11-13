'use strict';

import {LatLng} from './latlng.model';
import {Place} from './place.model';

/** @classdesc Describes a location where vehicles stop to pick up or drop off passengers.
 * Partial immplementation of generic Stop type suggested by the Google Static Transit API (GTFS).
 * See: https://developers.google.com/transit/gtfs/reference/stops-file
*/
export class Stop extends Place {
	protected _isStation: boolean;
	
	public constructor(apiId: string, name: string, location: LatLng, isStation?: boolean)
	public constructor(modelId: number);
	public constructor() {
			super(typeof arguments[0] === 'number' // modelId / apiId
				&& arguments[1] === undefined // name
				&& arguments[2] === undefined // location
				&& arguments[3] === undefined // isStation
				? arguments[0] // modelId
				: undefined
		);
			this._className = 'Stop';
			if (typeof arguments[0] !== 'number' || arguments[0] !== parseInt(arguments[0])) {  // normal instantiation
				this._apiId = arguments[0];
				this._name = arguments[1];
				this._location = arguments[2];
				this._isStation = arguments[3] || false;
			}
	}

	/** Gets whether stop is station (read-only) */
	public isStation(): boolean {return this._isStation};

	/** Gets a JSON representation of the object's state, including a flattened location*/
	public toJSON(): any {
		let json: any = super.toJSON();
		if (typeof this._isStation !== 'undefined') {json._isStation = this._isStation};
		return json; 
	}
}