'use strict';

import {LatLng} from './../../../core/latlng.model';
import {Stop} from './../../../core/stop.model'
import {ITransitAPIProduct} from './../../../core/transit-product.interface';

/** @classdesc Describes a location where vehicles stop to pick up or drop off passengers.
 * Basically exists to provide custom parsing of JSON from Rejseplanen.dk into generic GTFS Stop type.
 */
export class RejseplanenStop extends Stop implements ITransitAPIProduct{
	
	public constructor(apiId: string, name: string, location: LatLng, isStation?: boolean);
    public constructor(modelId: number);
	public constructor() {
		super(arguments[0], arguments[1], arguments[2], arguments[3]);
            this._className = 'RejseplanenStop';
	}

    /** Creates stop by parsing API service JSON  */
    public createProduct(json: any): RejseplanenStop {
        let stop = new RejseplanenStop(
            json.id,
			json.name,
			new LatLng(parseInt(json.x) / 1000000, parseInt(json.y) / 1000000)
        );
        return stop
    }

    /** Gets product (i.e. class) name (read-only)*/
    public productName(): string {
        return this._className;
    }
}