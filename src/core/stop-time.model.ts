'use strict';

import {classMap} from './../app.module';
import {IllegalArgumentError} from './../util/error.model';
import {Model} from './model';
import {promiseEach} from './../util/promise';
import {Stop} from './stop.model';
import {Trip} from './trip.model';

/** @classdesc Describes when a vehicle arrives at a location, how long it stays there,
 *  and when it departs, i.e. defines the path and schedule of Trips.
 * Partial immplementation of generic StopTime type suggested by the Google Static Transit API (GTFS).
 * See: https://developers.google.com/transit/gtfs/reference/stop_times-file
*/
export class StopTime extends Model {
	private _sequence: Number;
	private _stop: Stop;
	private _trip: Trip;
	private _departure_planned: Date;
	private _departure_actual: Date;
	private _departure_track_planned: string;
	private _departure_track_actual: string;
	private _arrival_planned: Date;
	private _arrival_actual: Date;
	private _arrival_track_planned: string;
	private _arrival_track_actual: string;
		
	public constructor(_apiId: string, seq?: Number, departure_planned?: Date, departure_actual?: Date, departure_track_planned?: string, departure_track_actual?: string, arrival_planned?: Date, arrival_actual?: Date, arrival_track_planned?: string, arrival_track_actual?: string)
	public constructor(modelId: number);
	public constructor() {
		super(typeof arguments[0] === 'number' // modelId / apiId
				&& arguments[1] === undefined // seq
				&& arguments[2] === undefined // departure_planned
				&& arguments[3] === undefined // departure_actual
				&& arguments[4] === undefined // departure_track_planned
				&& arguments[5] === undefined // departure_track_actual
				&& arguments[6] === undefined // arrival_planned
				&& arguments[7] === undefined // arrival_actual
				&& arguments[8] === undefined // arrival_track_planned
				&& arguments[9] === undefined // arrival_track_actual
				? arguments[0] // modelId
				: undefined
		);
		this._className = 'StopTime';
		if (typeof arguments[0] !== 'number' || arguments[0] !== parseInt(arguments[0])) {  // normal instantiation
			this._apiId = arguments[0];
			if (arguments[1] !== undefined) {this.sequence( arguments[1]);} // leverage validation in accessor 
			this._departure_planned = arguments[2];
			this._departure_actual = arguments[3];
			this._departure_track_planned = arguments[4];
			this._departure_track_actual = arguments[5];
			this._arrival_planned = arguments[6];
			this._arrival_actual = arguments[7];
			this._arrival_track_planned = arguments[8];
			this._arrival_track_actual = arguments[9];
		}	
	}

	/** Gets or sets actual (realtime) arrival */
	public arrivalActual(actual: Date): Date;
	public arrivalActual(): Date;
	public arrivalActual(): Date {
		if (arguments.length > 0) {this._arrival_actual = arguments[0];}
		return this._arrival_actual;
	}

	/** Gets planned arrival (read-only) */
	public arrivalPlanned(): Date {return this._arrival_planned;}

	/** Gets or sets actual realtime() arrival track */
	public arrivalTrackActual(track: string): string;
	public arrivalTrackActual(): string;
	public arrivalTrackActual(): string {
		if (arguments.length > 0) {this._arrival_track_actual = arguments[0];}
		return this._arrival_track_planned;
	}

	/** Gets or sets planned arrival track */
	public arrivalTrackPlanned(track: string): string;
	public arrivalTrackPlanned(): string;
	public arrivalTrackPlanned(): string {
		if (arguments.length > 0) {this._arrival_track_planned = arguments[0];}
		return this._arrival_track_planned;
	}

	/** Gets or sets actual (realtime) departure */
	public departureActual(actual: Date): Date;
	public departureActual(): Date;
	public departureActual(): Date {
		if (arguments.length > 0) {this._departure_actual = arguments[0];}
		return this._departure_actual;
	}

	/** Gets planned departure (read-only) */
	public departurePlanned(): Date {return this._departure_planned;}

	/** Gets or sets actual (realtime) departure track */
	public departureTrackActual(track: string): string;
	public departureTrackActual(): string;
	public departureTrackActual(): string {
		if (arguments.length > 0) {this._departure_track_actual = arguments[0];}
		return this._departure_track_actual
	}

	/** Gets or sets planned departure track */
	public departureTrackPlanned(track: string): string;
	public departureTrackPlanned(): string;
	public departureTrackPlanned(): string {
		if (arguments.length > 0) {this._departure_track_planned = arguments[0];}
		return this._departure_track_planned;
	}

	/** Re-references complex objects after primary de-serialization has completed.
	 * Realization of Serializable interface; see this for further details.
	 */
	public onDeserialized(modelMap: Map<number, any>): void {
		this._stop = modelMap.get(parseInt((<any>this._stop)._modelId));
		this._trip = modelMap.get(parseInt((<any>this._trip)._modelId));
	}

	/** Reads StopTime and, optionally, its immediate descendants in from local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public readObject(self: StopTime, recurse: boolean = true): Promise<StopTime> {
		let Constructr: any;
		return super.readObject(self)
			.then((stopTime: StopTime) => {
				if (stopTime) { // object found in storage, parse
					if (recurse) {
						let collection: Array<Model> = [];
						if (self._stop) {
							Constructr = classMap.models[(<any>self._stop)._className];
							self._stop = new Constructr((<any>self._stop)._modelId);
							void collection.push(self._stop);
						}
						if (self._trip) {
							Constructr = classMap.models[(<any>self._trip)._className];
							self._trip = new Constructr((<any>self._trip)._modelId);
							if (recurse) {void collection.push(self._trip);}
						}
						return promiseEach(collection, 'readObject')
							.then(() => {
								return Promise.resolve(self);
							})
							.catch((e) => {
								console.log(e);
							});
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
	
	/** Gets or sets sequence no. in Trip */
	public sequence(seq: Number): Number;
	public sequence(): Number
	public sequence(): Number {
		if (arguments.length > 0) {
			let seq = arguments[0];
			if (seq !== parseInt(seq)) {
				throw new IllegalArgumentError('expected integer');				
			}
			this._sequence = seq;
		}
		return this._sequence
	}

	/** Gets or sets stop */
	public stop(stop: Stop): Stop;
	public stop(): Stop;
	public stop(): Stop {
		if (arguments.length > 0) {this._stop = arguments[0];}
		return this._stop;
	}
	
	/** Returns internal state as JSON object */
	public toJSON(): any {
		let json: any = super.toJSON();
		if (this._arrival_planned) {json._arrival_planned = this._arrival_planned;}
		if (this._arrival_actual) {json._arrival_actual = this._arrival_actual;}
		if (this._arrival_track_planned) {json._arrival_track = this._arrival_track_planned;}
		if (this._departure_planned) {json._departure_planned = this._departure_planned;}
		if (this._departure_actual) {json._departure_actual = this._departure_actual;}
		if (this._departure_track_planned) {json._departure_track = this._departure_track_planned;}
		if (this._sequence) {json._sequence = this._sequence;}
		if (this._stop) {json._stop = {_className: this._stop.className(), _modelId: this._stop.modelId()};}
		if (this._trip) {json._trip = {_className: this._trip.className(), _modelId: this._trip.modelId()};}
		return json;
	}

	/** Gets or sets trip */
	public trip(stop: Trip): Trip;
	public trip(): Trip
	public trip(): Trip {
		if (arguments.length > 0) {this._trip = arguments[0];}
		return this._trip;
	}
	
	/** Writes StopTime and, optionally, its immediate descendants out to local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public writeObject(self: StopTime, recurse: boolean = false): Promise<number> {
		let collection: Array<Model> = [];
		if (recurse) {
			if (this._stop) {
				void collection.push(this._stop);
			}
			if (this._trip) {
				void collection.push(this._trip);
			}
		}
		return promiseEach(collection, 'writeObject', recurse)
			.then(() => {
				return super.writeObject(self);
			})
			.catch((e) => {
				console.log(e);
			});
	}
}