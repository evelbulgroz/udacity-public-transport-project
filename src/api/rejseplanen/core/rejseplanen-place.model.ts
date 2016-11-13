'use strict';
import {LatLng} from './../../../core/latlng.model';
import {Place} from './../../../core/place.model';
import {ITransitAPIProduct} from './../../../core/transit-product.interface';

/** @classdesc Describes information about a place.
 * Basically exists to provide custom parsing of JSON from Rejseplanen.dk into generic Place type.
 */
export class RejseplanenPlace extends Place implements ITransitAPIProduct{
    
    private _type: string;
    
    public constructor(apiId: string, name: string, location: LatLng);
    public constructor(modelId: number);
	public constructor() {
		super(arguments[0], arguments[1], arguments[2]);
        this._className = 'RejseplanenPlace';       
	}

    /** Creates place by parsing API service JSON  */
    public createProduct(json: any): RejseplanenPlace {
        let place = new RejseplanenPlace (
            json.id,
			json.name,
			new LatLng(parseInt(json.x) / 1000000, parseInt(json.y) / 100000)
        );
        void place.type(json.type);
        return place
    }

    /** Gets product (i.e. class) name (read-only)*/
    public productName(): string {
        return this._className;
    }

    /** Gets or sets type */
	public type(type: string): string;
    public type(): string;
    public type(): string {
        if (arguments.length > 0) {
            this._type = arguments[0];
        }
        return this._type
    };

    /** Gets a JSON representation of the object's state, including a flattened location*/
	public toJSON(): any {
		let json = super.toJSON();
        json._type = this._type;
        return json;
	}
}