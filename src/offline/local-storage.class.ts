'use strict';

//import { Injectable } from '@angular/core';

import {IndexedDbStorage} from'./indexeddb-storage.class';
import {Serializable} from './../core/serializable.interface';

/** @classdesc Provides the context object for the local storage Strategy pattern
 * i.e. hiding the concrete storage implementation from the client/caller, and the
 * client from the concrete implementation
*/
//@Injectable() // tried injecting at construction, but db connecton seems to time out
export class LocalStorage {
	//private _checkDuplicates: boolean = true;
	private _storageUnavailableMsg: string = 'Local storage not available on this device';
	private _strategy: IndexedDbStorage;

	constructor() {
		// instantiate concrete local storage implementation
		// i.e. pick "Strategy" at runtime
		if (window.indexedDB) {
			this._strategy = new IndexedDbStorage();
		}
		// (hypothetical) alternatives here
		else {
			console.log(this._storageUnavailableMsg);
		}
	}
	
	/** Resets local storage, removing all data but retaining structure */
	public clear(): Promise<boolean> {
		let self: LocalStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			if (self._strategy) {
				self._strategy.clear()
					.then((ok: boolean) => {
						resolve(ok);
					})
					.catch((e) => {
						reject(e); // bubble error up to caller
					});
			}
			else {
				reject(self._storageUnavailableMsg);
			}
		});
	}

	/** Gets every item from local storage in a structured (default, if available) or flattened collection
	 * @param {Boolean} flatten If true, objects from all stores are returned in a flattened collection
	 * @returm {Object} Object literal holding copy of all date in storage   
	 */
	public getAll(flatten: boolean = false): Promise<any> {
		let self: LocalStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			if (self._strategy) {
				self._strategy.getAll(flatten)
					.then((collection: any) => {
						resolve(collection);
					})
					.catch((e) => {
						reject(e); // bubble error up to caller
					});
			}
			else {
				reject(self._storageUnavailableMsg);
			}
		});
	}

	/** Gets an entry from local storage
	 * @return Promise that resolves to the object being retreived
	 */
	public get(object: Serializable, key?: number): Promise<any> {
		let self: LocalStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			if (self._strategy) {
				self._strategy.retrieve(object, key)
					.then((json: any) => {
						resolve(json);
					})
					.catch((e) => {
						reject(e); // bubble error up to caller
					});								
			}
			else {
				reject(self._storageUnavailableMsg);
			}
		});
	}

	/** Removes an entry from local storage
	 * @return Promise that resolves to the removed (i.e. deleted) object
	 */
	public remove(object: Serializable, key?: number): Promise<Serializable> {
		let self: LocalStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			if (self._strategy) {
				self._strategy.delete(object, key)
					.then((deletedObject: any) => {
						resolve(deletedObject);
					})
					.catch((e) => {
						reject(e);
					});		
			}
			else {
				reject(self._storageUnavailableMsg);
			}
		});
	}

	/** Saves an entry to local storage
	 * @return Promise that resolves to the storage key of the stored object
	 */
	public store(object: Serializable): Promise<number> {
		let self: LocalStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			if (self._strategy) {
				self._strategy.retrieve(object)
					.then((storedObject: any) => {
						if (!storedObject) { // add to storage if not already there
							self._strategy.create(object)
							.then((key: number) => {
								resolve(key);
							})
							.catch((e) => {
								reject(e);
							});
						}
						else { // update
							self._strategy.update(object)
							.then((key: number) => {
								resolve(key);
							})
							.catch((e) => {
								reject(e);
							});
						}
					})
					.catch((e) => {
						reject(e); // bubble error up to caller
					});
			}
			else {
				reject(self._storageUnavailableMsg);
			}
		});
	}
}