'use strict';

import {ITransitAPIProduct} from './../../../core/transit-product.interface';
import {Route} from './../../../core/route.model';
import {Trip} from './../../../core/trip.model';

/** Represents a time specific (i.e. scheduled) trip along a route */
export class RejseplanenTrip extends Trip implements ITransitAPIProduct {
	private _detailsUrl: string;

	public constructor(apiId: string, name: string, direction: boolean, cancelled?: boolean, route?: Route, detailsUrl?: string, iconUrl?: string, iconAltText?: string);
	public constructor(modelId: number);
	public constructor() {
		super (arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[6], arguments[7]); // all except detailsUrl
		this._className = 'RejseplanenTrip';
		this._detailsUrl = arguments[5];
	}
	
	/** Creates trip by parsing generic json.
	 * Mostly here to satisfy ITransitAPIProduct,
	 * not currently used by any service.
	 */
	public createProduct(json: any): RejseplanenTrip {
		let trip = new RejseplanenTrip(
			json.id,
			json.name, // may not be trip name, depending on calling service json
			false,
			json.cancelled ? true : false,
			undefined,
			json.JourneyDetailRef ? json.JourneyDetailRef.ref : undefined
		);
		return trip;
	}
	
	/** Gets additional trip info from api service (dummy implementation) */
	public detailsUrl(): string {
		return this._detailsUrl;
	}

	/** Gets product (i.e. class) name (read-only)*/
    public productName(): string {
        return this._className;
    }

	/** Gets a JSON representation of the object's state */
	public toJSON(): any {
		let json: any = super.toJSON();
		if (typeof this._detailsUrl !== 'undefined') {json._detailsUrl = this._detailsUrl;}
		return json;
	}
}