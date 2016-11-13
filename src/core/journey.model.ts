'use strict';

import {classMap} from './../app.module';
import {Leg} from'./leg.model';
import {Model} from './model';
import {promiseEach} from './../util/promise';
import {Serializable} from './serializable.interface';

/** classdesc Describes a passenger journey combining one or more legs on individual routes
 *  (so basically a collection of Legs) */
export class Journey extends Model {
	protected _legs: Leg[] = [];

	public constructor(modelId: number);
	public constructor();
	public constructor() {
		super(arguments.length === 1 ? arguments[0] : undefined);
		this._className = 'Journey';
	};

	/** Adds leg */
	public addLeg(leg: Leg): Leg {
		this._legs.push(leg);
		return leg;
	}

	/** Flattens object hierarchy into object map keyed by modelId */
	public flatten(): Map<number, any> {
		let map: Map<number, any> = new Map<number, any>();
		
		function _mapAdd(model: Model): void {
			if (model && !map.get(model.modelId())) {
				map.set(model.modelId(),model);
			}
		}

		this._legs.forEach((leg: Leg) => {
			_mapAdd(this);
			_mapAdd(leg);
			_mapAdd(leg.origin());
			_mapAdd(leg.origin().stop());
			_mapAdd(leg.origin().trip());
			_mapAdd(leg.origin().trip().route());
			_mapAdd(leg.origin().trip().route().agency());
			_mapAdd(leg.destination().stop());
			_mapAdd(leg.destination().trip());
			_mapAdd(leg.destination().trip().route());
			_mapAdd(leg.destination().trip().route().agency());
			_mapAdd(leg.destination());
		});
		return map;
	}
	
	/** Gets legs (read-only) */
	public legs(): Leg[] {
		return this._legs;
	}

	/** Re-references complex objects after primary de-serialization has completed.
	 * Realization of Serializable interface; see this for further details.
	 */
	public onDeserialized(modelMap: Map<number, any>): void {
		this._legs.forEach((json: any, ix: number) => {
			this._legs[ix] = modelMap.get(parseInt(json._modelId));
		});
	}

	/** Reads Journey and, optionally, its immediate descendants in from local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public readObject(self: Journey, recurse: boolean = false): Promise<Journey> {
		return super.readObject(self, recurse)
			.then((journey: Journey) => {
				if (journey) { // object found in storage, parse
					if (recurse) {
						self._legs.forEach((leg: any, ix: number) => {
							let Constructr: any = classMap.models[leg._className];
							self._legs[ix] = new Constructr(leg._modelId);
						})
						return promiseEach(self._legs, 'readObject', recurse)
							.then(() => {
								return Promise.resolve(self); 
							})
							.catch((e) => {
								return Promise.reject(e);
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

	/** Removes Journey and its immediate descendants in the object model from local storage,
	 * overloading parent method to ensure removal of the whole object model hierarchy,
	 * and relying on descendants to do the same
	 * @return Promise resolving to the primary removed object
	 */
	public removeObject(self: Serializable): Promise<Serializable> {
		this._legs.forEach((leg: Leg) => {
			void leg.removeObject(leg);
		});
		return super.removeObject(self);
	}

	/** Returns internal state as JSON object */
	public toJSON(): any {
		let json: any = super.toJSON(); 
		json._legs = [];
		this._legs.forEach((leg: Leg) => {
			void json._legs.push({_className: leg.className(), _modelId: leg.modelId()});
		});
		return json;
	}

	/** Writes Journey and, optionally, its immediate descendants out to local storage.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public writeObject(self: Journey, recurse: boolean = false): Promise<number> {
		return super.writeObject(self, recurse)
			.then(() => {
				if (recurse) {
					return promiseEach(self._legs, 'writeObject', recurse);
				}
				else {
					return Promise.resolve(self.modelId());
				}
			})
			.catch((e) => {
				console.log(e);
			});
	}
}