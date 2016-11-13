'use strict';

import {applyMixins} from './../util/mixin';
import {IdGenerator} from './../util/id-generator.class';
import {Serializable, Serializable_Defaults} from './serializable.interface';

/** @classdesc Abstract base class for all model classes.
 * Mostly provides generic support for serialization and deserialization
 * of data to store locally on device.
 */
export abstract class Model implements Serializable {
	protected _apiId: string; // any object id provided by transit apiId
	protected _className: string = 'Model'; // the class name of the specific model (for use in deserialization)
	protected _modelId: number; // app internal unique model id
	
	/** Creates a new Model, or prepares existing Model for re-instantiation from storage
	 * if provided with a single integer parameter that is the Model's unique id
	 * @param {integer} modelId of Model to be re-instantiated from storage (optional)
	 */
	constructor(modelId: number)
	constructor();
	constructor() {
		if (arguments.length === 1 && typeof arguments[0] === 'number' && arguments[0] === parseInt(arguments[0])) { // single, integer param
			this._modelId = arguments[0]; // ergo, object will be recreated from storage
			while (IdGenerator.getInstance().getUniqueId() <= this._modelId) {
				// increment unique model id generator past this Model's id
				IdGenerator.getInstance().getUniqueId()
			}	
		}
		else { // normal instantiation
			this._modelId = IdGenerator.getInstance().getUniqueId();
		}
	}

	/** Gets the name of the model's class (read-only) */
	className(): string {
		return this._className;
	}
	
	/** Gets or sets optional API id */
	public apiId(id: any): any;
	public apiId(): any;
	public apiId(): any {
		if (arguments.length > 0) {
			this._apiId = arguments[0];
		}
		return this._apiId;
	}

	/** Flattens object hierarchy into object map (literal) keyed by modelId
	 * Implemented here so collaborators can safely assume method exists:
	 * overload in derived classes that actually need it.
	 */
	public flatten(): Map<number, any> {
		let map: Map <number, any> = new Map<number, any>();
		map.set(this._modelId, this);
		return map;
	}
	
	/** Gets unique model id internal to app (read-only) */
	public modelId(): any {
		return this._modelId;
	}

	/** Does generic work of converting model to json
	 * Call first before doing specific conversion in derived classes 
	 */
	public toJSON(): any {
		let json: any = {};
		if (this._apiId) {json._apiId = this._apiId;}
		if (this._className) {json._className = this._className;}
		if (this._modelId) {json._modelId= this._modelId;}
		return json;
	}
	
	// Dummy implementations to 'cheat' ts compiler
	public onDeserialized(objectMap: Map<number, any>): void {void objectMap} // dummy method while waiting for implementation
	// Workaround for TS compilers' insistence that mixed in methods are defined at compile time
	//  when allowing overloads. Required when derived classes need to call super.methodName on mixins
	public readObject(object: Serializable, recurse: boolean = true): Promise<any> {return Serializable_Defaults.prototype.readObject(object, recurse);}
	public removeObject(object: Serializable): Promise<Serializable> {return Serializable_Defaults.prototype.removeObject(object);}
	public writeObject(object: Serializable, recurse: boolean = true): Promise<number> {return Serializable_Defaults.prototype.writeObject(object, recurse);}
}

// Mix in default interface methods (ineffective for overloads)
applyMixins(Model, [Serializable_Defaults], true);