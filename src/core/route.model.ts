'use strict';

import {classMap} from './../app.module';
import {Agency} from './agency.model';
import {IllegalArgumentError} from './../util/error.model';
import {Model} from './model';
import {Trip} from './trip.model';

/** @classdesc Describes the equivalent of a "Line" in a public transportation system.
 * Made up of one or more Trips. Trips occur at a specific time so a Route is time-independent.
 * Partial implementation of generic Route type defined by the Google Static Transit API (GTFS).
 * See: https://developers.google.com/transit/gtfs/reference/routes-file
*/
export class Route extends Model {
	protected _agency: Agency;
	protected _trips: Array<Trip> = [];
	protected _type: Number;
	protected _apiId: string;
	protected _name: string;
	protected _iconUrl: string;
	protected _iconAltText: string;
	
	/** Creates a new Route, or prepares existing Route for re-instantiation from storage
	 * if provided with a single integer parameter that is the Route's unique id
	 * @param {integer} modelId of Route to be re-instantiated from storage (optional)
	 */
	public constructor(apiId: string, name: string, type?: Number, iconUrl?: string, iconAltText?: string);
	public constructor(modelId: number);
	public constructor() {
		super(typeof arguments[0] === 'number' // modelId / apiId
				&& arguments[1] === undefined // name
				&& arguments[2] === undefined // type
				&& arguments[3] === undefined // iconUrl
				&& arguments[4] === undefined // iconAltText
				? arguments[0] // modelId
				: undefined
		);
		this._className = 'Route';
		if (typeof arguments[0] !== 'number' || arguments[0] !== parseInt(arguments[0])) {  // normal instantiation
			this._apiId = arguments[0];
			this._name = arguments[1];
			if (arguments[2]) {void this.type(arguments[2]);} // leverage validation in accessor
			this._iconUrl = arguments[3];
			this._iconAltText = arguments[4];
		}
	}
	
	/** Gets list of types of transportation used on a route */
	public static types() {
		return {
			lightrail: 0, //Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.
			subway: 1, // Subway, Metro. Any underground rail system within a metropolitan area.
			rail: 2, // Used for intercity or long-distance travel.
			bus: 3, // Used for short- and long-distance bus routes.
			ferry: 4, // Used for short- and long-distance boat service.
			cablecar: 5, // Used for street-level cable cars where the cable runs beneath the car.
			gondola: 6, // Suspended cable car. Typically used for aerial cable cars where the car is suspended from the cable.
			funicular: 7, // Any rail system designed for steep inclines.
			pedestrian: 8 // Any walking incurred along journey (custom addition)
		}
	}

	/** Adds trip when setting up route.
	 * Also sets trip's route, overwriting any existing route on trip.
	 */
	public addTrip(trip: Trip): Trip {
		void this._trips.push(trip); 
		void trip.route(this);
		return trip;
	}

	/** Gets or sets agency */
	public agency(agency: Agency): Agency;
	public agency(): Agency;
	public agency(): Agency {
		if (arguments.length > 0) {
			this._agency = arguments[0];
		}
		return this._agency;
	}

	/** Gets trip by name attribute */
	public getTripByName(name: string): Trip {
		return this._trips.find((trip: Trip) => trip.name() === name);
	}
	
	/** Gets or sets icon url */
	public iconUrl(url: string): string;
	public iconUrl(): string;
	public iconUrl(): string {
		if (arguments.length > 0) {
			this._iconUrl = arguments[0];
		}
		return this._iconUrl;
	}

	/** Gets or sets icon alt text */
	public iconAltText(url: string): string;
	public iconAltText(): string;
	public iconAltText(): string {
		if (arguments.length > 0) {
			this._iconAltText = arguments[0];
		}
		return this._iconAltText;
	}
	
	/** Gets name (read-only) */
	public name(): string {return this._name;}

	/** Re-references complex objects after primary de-serialization has completed.
	 * Realization of Serializable interface; see this for further details.
	 */
	public onDeserialized(modelMap: Map<number, any>): void {
		if (this._agency) {this._agency = modelMap.get(parseInt((<any>this._agency)._modelId));}
		this._trips.forEach((trip: Trip, ix: number) => {
			this._trips[ix] = modelMap.get(parseInt((<any>trip)._modelId));
		});
	}
	
	/** Reads Route and, optionally, its immediate descendants in from local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public readObject(self: Route, recurse: boolean = false): Promise<Route> {
		return super.readObject(self)
			.then((route: Route) => {
				if (route) { // object found in storage, parse
					if (recurse) {
						if (self._agency) {
							let Constructr: any = classMap.models[(<any>self._agency)._className];
							self._agency = new Constructr((<any>self._agency)._modelId);
							self._agency.readObject(self._agency, recurse)
								.then(() => {
									return Promise.resolve(self);
								})
								.catch((e) => {
									console.log(e);
								});
						}
						if (self._trips) { // for now, just create empty objects of the class collaborators expect
							// further resolution here risks infinite recursion, and we don't currently need the actual data
							// revisit later, e.g. if/when implementing separate re-referincing step, e.g. onDeserialized()
							let Constructr: any = classMap.models[(<any>self._trips[0])._className];
							self._trips.forEach((trip: Trip, ix: number) => {
								self._trips[ix] = new Constructr(trip.modelId);
							});
						}
						return Promise.resolve(self);
					}
					else {
						return Promise.resolve(self);
					}
				}
				else { // object not found in storage, return undefined
					return Promise.resolve(undefined);
				}	
			})
			.catch((e) => {
				console.log(e);
			});
	}

	/** Gets trips (read-only) */
	public trips(): Trip[] {return this._trips;}

	/** Gets or sets type */
	public type(type: Number): Number;
	public type(): Number;
	public type(): Number {
		if (arguments.length > 0) {
			let type = arguments[0];
			if (type !== parseInt(type)) {
				throw new IllegalArgumentError('expected integer');				
			}
			this._type = type;
		}
		return this._type
	}

	/** Returns internal state as JSON object (shallow parsing to avoid infinite loops) */
	public toJSON(): any {
		let json: any = super.toJSON();
		if (this._agency) {json._agency = {_className: this._agency.className(), _modelId: this._agency.modelId()};}
		if (this._iconUrl) {json._iconUrl = this._iconUrl;}
		if (this._iconAltText) {json._iconAltText = this._iconAltText;}
		if (this._name) {json._name = this._name;}
		if (this._type) {json._type = this._type;}
		if (this._trips && this._trips.length) {
			json._trips = (() => {
				let trips: any = [];
				this._trips.forEach((trip) => {
					trips.push({
						_className: trip.className(),
						_modelId: trip.modelId()
					});
				});
				return trips;
			})();
		}
		return json;
	}

	/** Writes Route and, optionally, its immediate descendants out to local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public writeObject(self: Route, recurse: boolean = false): Promise<number> {
		let promises: Array<Promise<number>> = [];
		if (recurse && this._agency) {
			void promises.push(this._agency.writeObject(this._agency, recurse));
		}
		void promises.push(super.writeObject(self, recurse));
		return Promise.all(promises)
			.then((): Promise<number> => {
				return Promise.resolve(self.modelId());
			})
			.catch((e) => {
				console.log(e);
			});
	}
}