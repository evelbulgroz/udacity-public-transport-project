'use strict';

import { Injectable } from '@angular/core';

import {applyMixins} from './../util/mixin';
import {classMap} from './../app.module';
import {IdGenerator} from './../util/id-generator.class';
import {localStorage as storage} from './../app.module';
import {Model} from './../core/model';
import {promiseEach} from './../util/promise';
import {Serializable, Serializable_Defaults} from './../core/serializable.interface';

/** @classdesc Helper class for storing and retrieving component state to and from storage
 * Creating separate object to avoid extending Angular Component class (b/c unpredicatable consequences)
 * @author Ulrik H. Gade, October 2016
 */
@Injectable()
export class ComponentState implements Serializable {
	private _className: string = 'ComponentState';
	private _componentName: string;
	private _data: Array<Model> = [];
	private _modelId: number;
	private _query: any = {};
	
	public constructor(componentName: string, data?: Array<Model>, query?: any);
	public constructor(modelId: number);
	public constructor() {
		if (arguments.length == 1 && arguments[0] === parseInt(arguments[0])) { // prepare to recreate object from storage
			this._modelId = arguments[0];
		}
		else { // normal instantiation
			this._componentName = arguments[0]; // componentName
			this._data = arguments[1]; // data
			this._query = arguments[2]; // query
			this._modelId =  IdGenerator.getInstance().getUniqueId();
		}
	}
	
	/** Gets the ComponentState's own class name (read-only) */
	public className(): string {
		return this._className;
	}

	/** Gets the class name of the component ComponentState is holding state for (read-only) */
	public componentName(): string {
		return this._componentName;
	}

	/** Gets the ComponentState's data (read-only) */
	public data(): Array<Model> {
		return this._data;
	}

	/** Gets the ComponentState's id (read-only) */
	public modelId(): any {
		return this._modelId;
	}

	/** Gets the ComponentState's query (read-only) */
	public query(): any {
		return this._query;
	}

	/** Re-references complex objects after primary de-serialization has completed.
	 * Realization of Serializable interface; see this for further details.
	 */
	public onDeserialized(modelMap: Map<number, Model>): void {
		 // batch re-reference complex objects
		modelMap.forEach((model: Model) => {
			try { 
				model.onDeserialized(modelMap);
			}
			catch(e) {
				console.log(model);
				console.log(e);
			}
		});
		// custom work for ComponentState
		if (this._query.stop) {
			this._query.stop = modelMap.get(this._query.stop._modelId);
		}
		// _query.stopSuggestions seem to take care of themselves, so no action for now
	}
	
	/** Reads Journey and, optionally, its immediate descendants in from local storage.
	 * Reads all stored objects into flattened structure, to prevent redundant reads of frequently referenced objects.
	 * Overloads default method in Serializable interface; see this for further details.
	 * @return {Promise} A Promise that resolves to the re-instantiated ComponentState, or undefined if an error occured
	 */
	public readObject(self: ComponentState, recurse: boolean = false): Promise<ComponentState> {
		// helpers
		function _getModelMap(): Promise<Map<number, any>> {
			return storage.getAll(true)  // read in flattened collection of every object in storage (in json format)
				.then((objectMap: any) => {
					let Constructr: any, modelMap = new Map<number, any>();
					for (let key in objectMap) {
						Constructr = classMap.models[objectMap[key]._className]; // re-instantiate model from json
						if (Constructr) { // add model to new Map
							modelMap.set(parseInt(key), new Constructr(parseInt(objectMap[key]._modelId)));
						}
					};
					let modelArray = Array.from(modelMap.values()).map((value: any) => { // flatten map (promiseEach expects an Array)
						return value instanceof Model ? value : undefined
					});
					return promiseEach(modelArray, 'readObject', false) // re-populate models with data
						.then(() => {
							self.onDeserialized(modelMap); // re-place temporary object literals with references to complex data models
							return Promise.resolve(modelMap);
						})
				})
				.catch((e) => {
					Promise.reject(e);
				});
		}
		function _reReferenceModels(collection: Array<any> | Map<number, any> | Object, modelMap: Map<number, Model>): void {
			function _reReferenceItem(key: any, item: any, assign: Function) { // generic helper
				let modelId: number;
				if (item instanceof Model || (item._className && item._modelId >= 0)) { // item is Model instance or serialized Model reference 
						modelId = item instanceof Model ? item.modelId() : parseInt(item._modelId);
						if (modelMap.get(modelId)) { // update item if found in storage...
							assign(key, modelMap.get(modelId));
						}
						else { // ... else throw error:
							// writing to storage is slowish, so may not have time to finish before user aborts process
							throw new ReferenceError('Item missing in storage');
						}
					}
					else if (typeof item === 'number') { // number
						assign(key, item);
					}
					else if (!isNaN(Date.parse(item))) { // date
						assign(key, new Date(item));
					}
					else if (item instanceof Array || item instanceof Map || Object.keys(item).length > 0) { // recurse if collection
						_reReferenceModels(item, modelMap);
					}
					else {
						throw new TypeError(item + ' is not an instance of Model');
					}
				};
			
			let assign: Function;
			if (collection instanceof Array) {
				assign = (ix: number, value: any) => {collection[ix] = value;}
				(<Array<any>>collection).forEach((item: any, ix: number) => {
					_reReferenceItem(ix, item, assign)
				});
			}
			else if (collection instanceof Map) {
				assign = (key: any, value: any) => {collection.set(key, value);}
				(<Map<number, any>>collection).forEach((item: any, key: number) => {
					_reReferenceItem(key, item, assign)
				});
			}
			else if (Object.keys(collection).length > 0) {  // assume object literal
				assign = (key: string, value: any) => {collection[key] = value;}
				for (let key in collection) {
					_reReferenceItem(key, collection[key], assign)
				}
			}
			else {
				throw new TypeError(collection + ' is not an Array, Map, or json object literal');
			}
		}

		// main routine
		return Serializable_Defaults.prototype.readObject(self) // read in ComponentState itself
			.then((state: ComponentState) => {
				if (recurse) {
					return _getModelMap() // get flat map of all Models in storage
						.then((modelMap: Map<number, any>) => {
							_reReferenceModels(state.data(), modelMap); // re-establish references to complex objects
							_reReferenceModels(state.query(), modelMap); // (skipped at reinstantiation to prevent infinite recursion)
							return Promise.resolve(state);
						})
						.catch((e) => {
							console.log(e);
							return Promise.resolve(undefined);
						});
				}
				else {
					return Promise.resolve(state);
				}
			})
			.catch((e: any) => {
				console.log(e);
				return Promise.resolve(undefined);
			})
	}
	
	// Workaround for TS compilers' insistence that mixed in methods are defined at compile time when allowing overloads:
	public removeObject(self: ComponentState): Promise<ComponentState> {
		return Serializable_Defaults.prototype.removeObject(self);
	}

	/** Returns internal state as JSON object */
	public toJSON(): any {
		return {
			_className: this._className,
			_componentName: this._componentName,
			_data: (() => {
				let data: Array<any> = [];
				this._data.forEach((model: Model) => {
					void data.push({
						_className: model.className(),
						_modelId: model.modelId()
					})
				});
				return data;
			})(),
			_modelId: this._modelId,
			_query: (() => {
				let query: any = {};
				for (let key in this._query) {
					if (this._query[key] instanceof Model) {
						query[key] = {
							_className: this._query[key].className(),
							_modelId: this._query[key].modelId()
						}
					}
					else { // assume primitive value
						query[key] = this._query[key];
					}
				}
				return query;
			})()
		}
	}

	/** Writes ComponentState and, optionally, its immediate descendants out to from local storage.
	 * Flattens object hierarchy before writing, to prevent redundant writes of frequently referenced objects.
	 * This limits the effect of the 'recurse' flag to deciding whether data and query terms are written or not;
	 * the flag is not passed on when calling writeObject on items in these collections.
	 * Overloads default method in Serializable interface; see this for further details.
	 */
	public writeObject(self: ComponentState, recurse: boolean = true): Promise<number> {
		function _storeData(): Promise<Map<number, any>> { //store data, flattening object model first to avoid redundant writes
			let objectMap: Map<number, any> = new Map<number, any>();
			self._data.forEach((model: Model) => {
				model.flatten().forEach((value: any, key: number) => {
					objectMap.set(key, value);
				});
			});
			return promiseEach(Array.from(objectMap.values()), 'writeObject', false);
		}
		function _storeQuery(): Promise<Map<number, any>> {
			let queryModels: Array<any> = [];
			for (let key in self.query()) { // make sure complex objects get stored
				if (self.query()[key] instanceof Model) {
					void queryModels.push(self.query()[key]);
				}
				else if (self.query()[key] instanceof Array) { // later maybe generalize to Iteratable
					(<Array<any>>self.query()[key]).forEach((item: any) => {
						if (item instanceof Model) {
							void queryModels.push(item);
						}
					});
				}
			}
			return promiseEach(queryModels, 'writeObject', false);
		}
		
		// main routine
		return storage.clear()
			.then(() => {
				return storage.store(self)
					.then(() => {
						if (recurse) {
							return Promise.all([_storeData(), _storeQuery()])
								.then(() => {
									return Promise.resolve((self.modelId()));
								})
								.catch((e) => {
									return Promise.reject(e);
								});
						}
						else {
							return Promise.resolve((self.modelId()));
						}
					})
					.catch((e) => {
						return Promise.reject(e);
					});
				
			})
			.catch((e) => {
				return Promise.reject(e);
			});
	}
}

// Mix in default interface methods
applyMixins(ComponentState, [Serializable_Defaults], true);