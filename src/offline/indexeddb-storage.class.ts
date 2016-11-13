'use strict';

import {classMap, preferences} from './../app.module';
import {LocalStoreable} from './localstoreable.interface';
import {Serializable} from './../core/serializable.interface';

/** @classdesc Manages app entries in the Web browser's indexedDB object store
 * i.e. concrete strategy for the local storage Strategy pattern.
*/
export class IndexedDbStorage implements LocalStoreable {
	private _db: any; // IDBDatabase
	private _dbName: string = preferences.localStoragePrefix; //'dk.ulrikgade.sr.webdev.public.transport.app';
	private _dbVersion: number = 1;
	private _modelNames: Array<string> = ['Agency', 'Journey', 'Leg', 'Place', 'Route', 'StopTime', 'Stop', 'Trip'];
	private _ready: boolean = false;
	private _storeMap: any = (() => { // maps class names to object store names
		let map: any = {};
		let apiPrefix: string = classMap.factories.apiFactory.getAPIPrefix();//apiReferences.factory.getAPIPrefix();
		this._modelNames.forEach((modelName: string) => {
			map[apiPrefix + modelName] = map[modelName] = modelName.toLowerCase();
		});
		map.ComponentState = 'componentstate';
		return map;
	})();
	private _storeNames: Array<string> = this._modelNames.map((name: string) => {return name.toLowerCase();});
	
	/** Creates an instance of IndexedDbStorage.
	 * Note: Initialization relies on async operation that only completes after the constructor has run.
	 * Query the ready() method before accessing storage.
	 */
	constructor() {
		void this._storeNames.push('componentstate');

		if (window.indexedDB) {
			let request: IDBOpenDBRequest = window.indexedDB.open(this._dbName, this._dbVersion);
			
			request.onsuccess = (event: any) => { // Event
				this._db = event.target.result;
				this._db.onclose = () => {'IndexedDB closed';}
				this._db.onversionchange = () => {
					this._db.close();
					alert('The app was updated. Please reload.');
				};
				this._ready = true;
			}
			
			request.onupgradeneeded = (event: any) => { // IBDVersionChangeEvent
				this._db = event.target.result;
				let self: any = this;
				this._storeNames.forEach((storeName: string) => {
					void self._db.createObjectStore(storeName, {keypath: '_modelId'});
				});
			};

			request.onblocked = () => {
				alert('Please close all other tabs with this app open, then reload.');
			}

			request.onerror = (event: Event) => {
				console.log(event);
			};
		}
		else {
			console.log('IndexedDB not available');
		}
	}

	/** Creates a new entry in indexedDB
	 * @return Promise that resolves to the storage key of the written object
	 */
	public create(object: Serializable): Promise<number> {
		let self: IndexedDbStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			this.ready()
				.then(() => {
					let storeName: string = self._storeMap[object.className()];
					let request: IDBRequest = self._db.transaction([storeName], 'readwrite')
												.objectStore(storeName)
												.add(object.toJSON(), object.modelId());
					request.onsuccess = (event: any) => { // later, maybe try to wrap this in a Promise
						resolve(event.target.result);
					}
			
					request.onerror = (event: any) => { 
						reject(event);
					}
				})
				.catch((e) => {
					reject(e)
				});
		});
	}

	/** Retrieves an entry from IndexedDB
	 * @param {Serializable} object The object whose state will be retrieved from storage. Ignored if passing in integer key.
	 * @param {Integer} key Key of the object to retrieve (optional).
	 * @return {Promise} Resolves to the object being retrieved
	 */
	public retrieve(object: Serializable, key?: number): Promise<any> {
		let self: IndexedDbStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			self.ready()
				.then(() => {					
					if (key === undefined) { // retrieve state for object itself, ignoring key
						let storeName: string = self._storeMap[object.className()];
						let request: IDBRequest = self._db.transaction([storeName], 'readonly')
													.objectStore(storeName)
													.get(object.modelId());
						
						request.onsuccess = (event: any) => { // returns object
							resolve(event.target.result);
						}
				
						request.onerror = (event: Event) => {
							reject(event);
						}
					}
					else { // retrieve state by key across stores, ignoring object
						this.getAll(true) // flatten map
							.then((objectMap: any) => {
								resolve(objectMap[key]);
							})
							.catch((e) => {
								reject(e);
							})
					}
				})
				.catch((e) => {
					reject(e);
				});
		});
	}

	/** Updates an entry in IndexedDB
	 * Simply saves afresh entry if not already in storage.
	 * @return Promise that resolves to the storage key of the updated object
	 */
	public update(object: Serializable): Promise<number> {
		let self: IndexedDbStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			self.ready()
				.then(() => {
					let storeName: string = self._storeMap[object.className()];
					let objectStore: IDBObjectStore = self._db.transaction([storeName], 'readwrite')
														.objectStore(storeName); 
					let getRequest: IDBRequest = objectStore.get(object.modelId());
					
					getRequest.onsuccess = (event: any) => { // get existing data from storage
						let data: any = event.target.result;
						let json = object.toJSON();
						if (data) { // data exists in storage, so update
							for (let prop in json) { 
								if (prop !== '_className' && prop !== '_modelId') { // update with changes
									data[prop] = json[prop];
								}
								if (!json[prop]) { // delete removed properties
									delete data[prop];
								}
							}
						}
						else { // store object afresh and as-is
							data = json;
						}
						
						let putRequest: IDBRequest = objectStore.put(data, object.modelId());
						putRequest.onsuccess = (event: any) => { // save changes back to storage
							resolve(event.target.result); // return object key
						};
						
						putRequest.onerror = (event: Event) => { 
							reject(event);
						}
					}
			
					getRequest.onerror = (event: Event) => { 
						reject(event);
					}
				})
				.catch((e) => {
					reject(e);
				});
		});
	}

	/** Deletes an entry from indexedDB
	 * @return Promise that resolves to the deleted object
	 */
	public delete(object: Serializable, key?: number): Promise<any> {
		let self: IndexedDbStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			self.ready()
				.then(() => {
					let storeName: string = self._storeMap[object.className()];
					let objectStore: IDBObjectStore = self._db.transaction([storeName], 'readwrite').objectStore(storeName); 
					let getRequest: IDBRequest = objectStore.get(key || object.modelId());
					
					getRequest.onsuccess = (event: any) => { // get existing data from storage
						let data: any = event.target.result;
						let deleteRequest: IDBRequest = objectStore.delete(object.modelId());
						
						deleteRequest.onsuccess = () => { // save changes back to storage
							resolve(data);  // returns deleted object
						};
						
						deleteRequest.onerror = (event: Event) => { 
							reject(event);
						}
					}
			
					getRequest.onerror = (event: Event) => { 
						reject(event);
					}
				})
				.catch((e) => {
					reject(e);
				})
		});
	}
	
	/** Clears IndexedDB, removing all data but retaining structure */
	public clear(): Promise<boolean> {
		let self = this;
		return new Promise((resolve: Function, reject: Function) => {
			self.ready()
				.then(() => {
					let objectStore: IDBObjectStore, clearRequest: IDBRequest;
					self.getAll()
						.then((objectMap: any) => {
							let storeNames: Array<string> = Object.keys(objectMap);
							// recursive helper function: async means we can't simply iterate over stores
							function _clearStores(storeNames: Array<string>): void {
								let storeName: string = storeNames.pop().toLowerCase();
								objectStore = self._db.transaction(storeName, 'readwrite')
										.objectStore(storeName); 
								clearRequest = objectStore.clear();
								clearRequest.onsuccess = () => {
									if (storeNames.length > 0) {
										_clearStores(storeNames);
									}
									else {
										resolve(true); // exit recursion and resolve Promise
									}
								};
								clearRequest.onerror= () => {
									reject('IndexedDB clear failed for store: ' + storeName);
								}
							}
							_clearStores(storeNames);
						})
						.catch((e) => {
							console.log(e);
						});
					})
					.catch((e) => {
						reject(e);
					});
		});
	}

	/** Gets every item from IndexedDB in a structured (default) or flattened collection
	 * @param {Boolean} flatten If true, objects from all stores are returned in a flattened collection
	 * @returm {Object} Object literal holding copy of all data in storage   
	 */
	public getAll(flatten: boolean = false): Promise<any> {
		let self = this;
		return new Promise((resolve: Function, reject: Function) => {
			self.ready()
				.then(()=> {
					let objectMap: any = {};
					let objectStore: IDBObjectStore, request: IDBRequest;
					let storeNames: Array<string> = this._storeNames.slice();
					
					// recursive helper function: async prevents simple iteration
					function _getStores(storeNames: Array<string>): void {
						let storeName: string = storeNames.pop();
						if (!flatten) {objectMap[storeName] = {};}
						objectStore = self._db.transaction([storeName.toLowerCase()], 'readwrite')
										.objectStore(storeName.toLowerCase()); 
						request = objectStore.openCursor();
						request.onsuccess = ((event: any) => {
							let cursor = event.target.result;
							if (cursor) {
								if (flatten) {
									objectMap[cursor.value._modelId] = cursor.value;
								}
								else {
									objectMap[storeName][cursor.value._modelId] = cursor.value;
								}
								cursor.continue();
							}
							else {
								if (storeNames.length) {
									_getStores(storeNames);
								}
								else {
									resolve(objectMap);
								}
							}
						});
						request.onerror = (event: Event) => {
							console.log(event);
						};
					}
					_getStores(storeNames)
		
					if (resolve === reject) {
						reject('IndexedDB getAll() failed');
					}
				})
				.catch((e) => {
					reject(e);
				});
		});
	}

	/* Determines whether storage initialization has completed
	 * @return {Promise} Resolves to true boolean when/if storage is ready
	 */
	private ready(): Promise<boolean> {
		let self: IndexedDbStorage = this;
		return new Promise((resolve: Function, reject: Function) => {
			let i: number = 0;
			let id: number = window.setInterval(() => {
				if (self._db && self._ready) {
					clearInterval(id);
					resolve(true);
				}
				else if (i > 9) {
					clearInterval(id);
					reject('indexedDB not ready, aborting db operation');
				}
				else {
					i++;
				}
			}, 10);
		});
	}
}