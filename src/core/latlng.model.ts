'use strict';

import {Model} from './model';

/** @classdescr Describes a point in geographical coordinates using the WGS84 system.
 * Partial implementation of the equivalent Google Maps API type.
 * See: https://developers.google.com/maps/documentation/javascript/3.exp/reference#LatLng
 * Note: Rejseplanen coordinates are multipled by 10^6
 */
export class LatLng extends Model {
	private _lat: number;  // range: -90 to 90 degrees
	private _lng: number; // range: -180 to 180 degrees
	
	public constructor(lat: number, lng: number);
	public constructor(modelId: number);
	public constructor(modelId: number) {
			super(arguments.length === 1 ? modelId : undefined);
			this._className = 'LatLng';
			if (arguments.length !== 1 || arguments[0] !== parseInt(arguments[0])) {  // normal instantiation
				this._lat = arguments[0];
				this._lng = arguments[1];
			}
	}

	/** Gets latitude (read-only) */
	public lat(): number {return this._lat};

	/** Gets longitude (read-only) */
	public lng(): number {return this._lng};

	/** Returns internal state as JSON object */
	public toJSON(): any {
		let json: any = super.toJSON();
		if (this._lat) {json._lat = this._lat;}
		if (this._lng) {json._lng = this._lng;}
		return json;
	}
}