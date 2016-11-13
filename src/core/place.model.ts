'use strict';

import {classMap} from './../app.module';
import {LatLng} from './latlng.model';
import {Model} from './model';

/** @classdescr Describes information about a place.
 * Partial implementation of the equivalent Google Maps API PlaceResult type.
 * See: https://developers.google.com/maps/documentation/javascript/3.exp/reference#PlaceResult
 * Note: Rejseplanen coordinates are multipled by 10^6
 */
export class Place extends Model {
	protected _name: string;
	protected _location: LatLng;

	/** Creates a new Place, or prepares existing Place for re-instantiation from storage
	 * if provided with a single integer parameter that is the Place's unique id
	 * @param {integer} modelId of Place to be re-instantiated from storage (optional)
	 */
	public constructor(apiId: string, name: string, location: LatLng);
	public constructor(modelId: number);
	public constructor() {
		super(typeof arguments[0] === 'number' // modelId / apiId
				&& arguments[1] === undefined // name
				&& arguments[2] === undefined // location
				? arguments[0] // modelId
				: undefined
		);
		this._className = 'Place';
		if (typeof arguments[0] !== 'number' || arguments[0] !== parseInt(arguments[0])) {  // normal instantiation
			this._apiId = arguments[0];
			this._name = arguments[1];
			this._location = arguments[2];			
		}	
	}

	/** Gets location or sets location */
	public location(): LatLng;
	public location(latnlng: LatLng): LatLng;
	public location(): LatLng {
		if (arguments.length > 0) {
			this._location = arguments[0];
		}return this._location
	};

	/** Gets or sets name */
	public name(): string;
	public name(name: string): string
	public name(): string {
		if (arguments.length > 0) {
			this._name = arguments[0];
		}
		return this._name
	};

	/** Re-references complex objects after primary de-serialization has completed.
	 * Realization of Serializable interface; see this for further details.
	 */
	public onDeserialized(modelMap: Map<number, any>): void {
		void modelMap;
	}

	/** Reads Place and, optionally, its immediate descendants in from local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public readObject(self: Place, recurse: boolean = false): Promise<Place> {
		let Constructr: any;
		return super.readObject(self, recurse)
			.then((place: Place) => {
				if (place) { // object found in storage, parse
					if (self._location) {
						Constructr = classMap.models[(<any>self._location)._className];
						self._location = new Constructr((<any>self._location)._modelId);
					}
					return Promise.resolve(self);
				}
				else { // object not found in storage, return undefined
					return Promise.resolve(undefined);
				}
			})
			.catch((e) => {
				console.log(e);
			});
	}
	
	/** Gets a JSON representation of the object's state */
	public toJSON(): any {
		let json: any = super.toJSON();
		if (this._name) {json._name = this._name;}
		if (this._location) {json._location = this._location.toJSON()}
		return json;
	}
}