'use strict';

import {classMap} from './../app.module';
import {Model} from './model';
import {Note} from './note.interface';
import {promiseEach} from './../util/promise';
import {Route} from './route.model';
import {StopTime} from './stop-time.model'; 

/** @classdesc 
 * /** Represents a time specific (i.e. scheduled) trip along a route (i.e. a sequence of StopTimes).
 * A single Trip represents one journey along a transit line or route.
 * Partial/custom immplementation of generic Trip type suggested by the Google Static Transit API (GTFS).
 * See: https://developers.google.com/transit/gtfs/reference/trips-file
*/
export abstract class Trip extends Model {
	protected _cancelled: boolean = false;
	protected _direction: boolean;
	protected _iconUrl: string;
	protected _iconAltText: string;
	protected _name: string;
	protected _notes: Array<Note> = [];
	protected _nextStopSequence: number = 0;
	protected _route: Route;
	protected _stopTimes: Array<StopTime> = [];
	protected _type: string;
	
	public constructor(apiId: string, name: string, direction: boolean, cancelled?: boolean, route?: Route, iconUrl?: string, iconAltText?: string)
	public constructor(modelId: number);
	public constructor() {
			super(typeof arguments[0] === 'number' // modelId / apiId
				&& arguments[1] === undefined // name
				&& arguments[2] === undefined // direction
				&& arguments[3] === undefined // cancelled
				&& arguments[4] === undefined // route
				&& arguments[5] === undefined // iconUrl
				&& arguments[6] === undefined // iconAltText
				? arguments[0] // modelId
				: undefined
		);
			this._className = 'Trip';
			if (typeof arguments[0] !== 'number' || arguments[0] !== parseInt(arguments[0])) {  // normal instantiation
				this._apiId = arguments[0];
				this._name = arguments[1];
				this._direction = arguments[2] || false; // cannot provide default in constructor when overloading
				this._cancelled = arguments[3] || false;
				this._route = arguments[4];
				this._iconUrl = arguments[5];
				this._iconAltText = arguments[6];
			}
	}

	/** Gets or sets cancellation */
	public cancelled(cancelled: boolean): boolean;
	public cancelled(): boolean
	public cancelled(): boolean {
		if (arguments.length > 0) {this._cancelled = arguments[0];}
		return this._cancelled;
	}

	/** Gets direction (read-only) */
	public direction(): boolean {return this._direction;}
	
	/** Gets or sets icon alt text */
	public iconAltText(url: string): string;
	public iconAltText(): string;
	public iconAltText(): string {
		if (arguments.length > 0) {
			this._iconAltText = arguments[0];
		}
		return this._iconAltText;
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

	/** Gets or sets name */
	public name(name: string): string;
	public name(): string;
	public name(): string {
		if (arguments.length > 0) {
			this._name = arguments[0];
		}
		return this._name;
	}

	/** Gets notes (read-only) */
	public notes(): Array<Note> {
		return this._notes;
	}
	
	/** Gets or sets route */
	public route(route: Route): Route;
	public route(): Route;
	public route(): Route {
		if (arguments.length > 0) {
			this._route = arguments[0];
		}
		return this._route;
	}

	/** Gets stops (read-only) */
	public stopTimes(): Array<StopTime> {
		return this._stopTimes;
	}

	/** Gets or sets type */
	public type(url: string): string;
	public type(): string;
	public type(): string {
		if (arguments.length > 0) {
			this._type = arguments[0];
		}
		return this._type;
	}
	
	/** Adds note to notes collection */
	public addNote(note: Note): Note {
		void this._notes.push(note);
		return note;
	}

	/** Adds stoptime next in sequence when setting up trip */
	public addStopTime(stopTime: StopTime): StopTime {
		void this._stopTimes.push(stopTime);
		void stopTime.sequence(this._nextStopSequence++);
		void stopTime.trip(this);
		return stopTime;
	}

	/** Flattens object hierarchy into object map keyed by modelId */
	public flatten(): Map<number, any> {
		let map: Map<number, any> = new Map<number, any>();
		
		function _mapAdd(model: Model): void {
			if (model && !map.get(model.modelId())) {
				map.set(model.modelId(), model);
			}
		}
		_mapAdd(this);
		_mapAdd(this.route());
		_mapAdd(this.route().agency());
		this._stopTimes.forEach((stopTime: StopTime) => {
			_mapAdd(stopTime);
			_mapAdd(stopTime.stop());
		});
		return map;
	}

	public getStopTimeByStopName(name: string): StopTime {
		let ret: StopTime;
		this._stopTimes.forEach((stopTime: StopTime) => {
			if (stopTime.stop() && stopTime.stop().name() === name) {
				ret = stopTime;
			}
		});
		return ret;
	}
	
	/** Re-references complex objects after primary de-serialization has completed.
	 * Realization of Serializable interface; see this for further details.
	 */
	public onDeserialized(modelMap: Map<number, any>): void {
		this._route = modelMap.get(parseInt((<any>this._route)._modelId));
		this._stopTimes.forEach((stopTime: StopTime, ix: number) => {
			this._stopTimes[ix] = modelMap.get(parseInt((<any>stopTime)._modelId));
		});
	}
	
	/** Reads Trip and, optionally, its immediate descendants in from local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public readObject(self: Trip, recurse: boolean = true): Promise<Trip> {
		return super.readObject(self)
			.then((trip: Trip) => {
				if (trip) { // object found in storage, parse
					if (recurse) {
						if (self._route) {
							let Constructr: any = classMap.models[(<any>self._route)._className];
							self._route = new Constructr((<any>self._route)._modelId);
							self._route.readObject(self._route, recurse)
								.catch((e) => {
									console.log(e);
								});
						}
						if (self._stopTimes) { // restore Stoptimes w/o lapsing into infinite recursion
							let collection: Array<Model> = [];
							self._stopTimes.forEach((stopTime: any, ix: number) => {
								let Constructr: any = classMap.models[stopTime._className];
								void collection.push(self._stopTimes[ix] = stopTime = new Constructr(stopTime._modelId));
							});
							return promiseEach(collection, 'readObject', false)
								.then(() => {
									return Promise.resolve(self);
								})
								.catch((e) => {
									console.log(e);
								});
						}
						return Promise.resolve(self);
					}
					else {
						return Promise.resolve(self);
					}
				}
				else {  // object not found in storage, return undefined
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
		if (typeof this._cancelled !== 'undefined') {json._cancelled = this._cancelled;}
		if (typeof this._direction !== 'undefined') {json._direction = this._direction;}
		if (this._iconAltText) {json._iconAltText = this._iconAltText;}
		if (this._iconUrl) {json._iconUrl = this._iconUrl;}
		if (this._name) {json._name = this._name;}
		if (this._notes) {json._notes = this._notes;}
		if (this._route) {json._route = {_className: this._route.className(), _modelId: this._route.modelId()};}
		json._stopTimes = (() => {
			let stoptimes: Array<any> = [];
			this._stopTimes.forEach((stopTime: StopTime) => {
				void stoptimes.push({
					_className: stopTime.className(),
					_modelId: stopTime.modelId()
				})
			})
			return stoptimes;
		})();
		if (this._type) {json._type = this._type;}
		return json;
	}

	
	/** Writes Leg and, optionally, its immediate descendants out to local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public writeObject(self: Trip, recurse: boolean = false): Promise<number> {
		let collection: Array<Model> = [];
		if (recurse) {
			if (this._route) {
				void collection.push(this._route);
			}
			this._stopTimes.forEach((stopTime: StopTime) => {  // store Stoptimes w/o lapsing into infinite recursion
				void collection.push(stopTime);
			});
		}
		return promiseEach(collection, 'writeObject', false)
			.then(() => {
				return super.writeObject(self, recurse);
			})
			.catch((e) => {
				console.log(e);
			});
	}
}