'use strict';

import {Message} from './message.interface';
import {Model} from './model';
import {Note} from './note.interface';
import {promiseEach} from './../util/promise';
import {StopTime} from './stop-time.model';
import {Trip} from './trip.model';

/** @classdesc Describes a leg on a passenger journey along a TransitRoute */
export class Leg extends Model {
	protected _messages: Array<Message> = [];
	protected _notes?: Array<Note> = [];
	protected _origin: StopTime;
	protected _destination: StopTime;
	protected _detailsUrl?: string;
	
	/** Creates a new Leg, or prepares existing Leg for re-instantiation from storage
	 * if provided with a single integer parameter that is the Leg's unique id
	 * @param {integer} modelId of Leg to be re-instantiated from storage (optional)
	 */
	public constructor(origin: StopTime, destination: StopTime, detailsUrl?: string, notes?: Array<Note>);//, apiId?: any);
	public constructor(modelId: number);
	public constructor() {
		super(typeof arguments[0] === 'number' // modelId / origin
				&& arguments[1] === undefined // destination
				&& arguments[2] === undefined // detailsUrl
				&& arguments[3] === undefined // notes
				//&& arguments[4] === undefined // apiId
				? arguments[0] // modelId
				: undefined
		);
		this._className = 'Leg';
		if (typeof arguments[0] !== 'number' || arguments[0] !== parseInt(arguments[0])) {  // normal instantiation
			this._origin = arguments[0];
			this._destination = arguments[1];
			this._detailsUrl = arguments[2];
			this._notes = arguments[3] || [];
			this._apiId = arguments[4];
		}	
	}

	/** Gets origin (read-only) */
	public origin(): StopTime {return this._origin;}

	/** Gets destination (read-only) */
	public destination(): StopTime {return this._destination;}

	/** Gets details reference (read-only) */
	public detailsUrl(): string {return this._detailsUrl;}

	/** Gets messages (read-only) */
	public messages(): Array<Message> {return this._messages;}
	
	/** Gets notes (read-only) */
	public notes(): Array<Note> {return this._notes;}

	/** Gets trip along which Leg is travelling (read-only)
	 * Note: Trip may only include partial list of Stop(Time)s corresponding with the Leg,
	 * i.e. not including every Stop(Time) along the entire Route.
	 */
	public trip(): Trip { // shortcut method; Leg has no direct knowledge of Trip
		return this._destination.trip() || this._origin.trip();
	}
	
	/** Add message to message list */
	public addMessage(message: Message): void {
		this._messages.push(message);
	}

	/** Add message to message list */
	public addNote(note: Note): void {
		this._notes.push(note);
	}

	/** Re-references complex objects after primary de-serialization has completed.
	 * Realization of Serializable interface; see this for further details.
	 */
	public onDeserialized(modelMap: Map<number, any>): void {
		this._origin = modelMap.get(parseInt((<any>this._origin)._modelId));
		this._destination = modelMap.get(parseInt((<any>this._destination)._modelId));
	}

	/** Reads Leg and, optionally, its immediate descendants in from local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public readObject(self: Leg, recurse: boolean = false): Promise<Leg> {
		return super.readObject(self)
			.then((leg: Leg) => {  // object found in storage, parse
				if (leg) {
					if (recurse) {
						let collection: Array<StopTime> = [];
						if (self._origin) {
							self._origin = new StopTime((<any>self._origin)._modelId);
							void collection.push(self._origin);
						}
						if (self._destination) {
							self._destination = new StopTime((<any>self._destination)._modelId);
							void collection.push(self._destination);
						}
						return promiseEach(collection, 'readObject', recurse)
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
	
	/** Returns internal state as JSON object */
	public toJSON(): any {
		let json: any = super.toJSON();
		if (this._origin) {json._origin = {_className: this._origin.className(), _modelId: this._origin.modelId()};}
		if (this._destination) {json._destination = {_className: this._destination.className(), _modelId: this._destination.modelId()};}
		if (this._detailsUrl) {json._detailsUrl = this._detailsUrl;}
		if (this._messages) {json._messages = this._messages;}
		if (this._notes) {json._notes = this._notes;}
		return json;
	}

	/** Writes Leg and, optionally, its immediate descendants out to local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public writeObject(self: Leg, recurse: boolean = true): Promise<number> {
		let collection: Array<Model> = [];
		if (recurse) {
			 if (this._destination) {
				 void collection.push(this._destination);
			}
			if (this._origin) {
				void collection.push(this._origin);
			}
		}
		return promiseEach(collection, 'writeObject', recurse)
			.then(() => {
				return super.writeObject(self, recurse);
			})
			.catch((e) => {
				console.log(e);
			});
	}
}