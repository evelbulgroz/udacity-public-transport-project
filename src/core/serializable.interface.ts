'use strict';

import {localStorage as storage} from './../app.module';

/** @classdesc Represents an interface for classes that can be serialized for local or remote storage.
	* Provides default methods that shield the storage details from clients, and that handle some generic
	* steps in object serialization and deserialization.
	* Inspired by, but not a direct copy of, the similar Java API.
	* NOTE: 'self' references in method signatures is needed b/c 'this' references have no meaning
	* in a TypeScript interface. For now, live with the redundancy.
*/

export interface Serializable {
	
	/** Gets the name of the model's class (read-only) */
	className(): string;
	
	/** Gets the model's unique id */
	modelId(): number;
	
	/** Re-references complex objects after primary de-serialization has completed
	 * @param {Map} modelMap A collection of every complex object available for re-referencing, key'd by modelId
	 */
	onDeserialized(objectMap: Map<number, any>): void;
	
	/** Reads object state in from local storage
	 * References to complex objects are expected to be stored as simple {_className: '', _modelId: ###} literals
	 * @param {Serializable} self Reference to object itself - b/c default methods are mixed in, 'this' cannot be trusted
	 * @param {Boolean} recurse Flag indicating whether to read in all descendants in the object's hierarchy, or just the object itself (default is false)
	 * @return {Promise} A Promise resolving to the updated object 
	 */
	readObject(self: Serializable, recurse: boolean): Promise<Serializable>;

	/** Removes object from local storage
	 * @return {Serializable} Reference to the object that was removed from storage
	 */
	removeObject(self: Serializable): Promise<Serializable>;

	/** Converts object state to JSON */
	toJSON(): any;

	/** Writes object state to local storage
	 * @param {Serializable} self Reference to object itself - b/c default methods are mixed in, 'this' cannot be trusted
	 * @param {Boolean} recurse Flag indicating whether to write out all descendants in the object's hierarchy, or just the object itself (default is false)
	 * @return {Promise} A Promise resolving to the (integer) storage key of the written object
	 */
	writeObject(self: Serializable, recurse: boolean): Promise<number>;
	
}

// Default implementations (mix in with applyMixins in realizing class)
export class Serializable_Defaults {
	public readObject(self: Serializable, recurse: boolean = false): Promise<Serializable> {
		void recurse; // keep TS compiler happy!
		function _isComplex(json: any): boolean {
			let keys: Array<string> = Object.keys(json); 
			return keys	&& keys.length == 2
					&& (keys[0] === '_className' || keys[0] === '_modelId')
					&& (keys[1] === '_className' || keys[1] === '_modelId');									
		}
		return new Promise((resolve: Function, reject: Function) => {
			storage.get(self)
				.then((json: any) => {
					if (!json) {
						resolve(undefined);
					}
					else {
						Object.keys(json).forEach((key: string) => { // overwrite with attributes from json
							if (json[key] && (!_isComplex(json[key]) || !self[key])) { // skip complex references unless missing
								self[key] = json[key];
							}
						});
						Object.keys(self).forEach((key: string) => { // remove attributes that aren't in json...
							if (json[key] && !_isComplex(json[key])) { // ignore complex object references
								self[key] = json[key]; // ...by effectively setting them to undefined
							}
						});
						resolve(self);
					}
				})
				.catch((e) => {
					reject(e);
				});
		})
	}
	
	public removeObject(self: Serializable): Promise<Serializable> {
		return storage.remove(self);
	}

	public writeObject(self: Serializable, recurse: boolean = false): Promise<number> {
		void recurse;  // keep TS compiler happy!
		return storage.store(self);
	}
}