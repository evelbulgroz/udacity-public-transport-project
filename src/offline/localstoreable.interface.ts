'use strict';

//import {Model} from './../core/model';
import {Serializable} from './../core/serializable.interface';

/** @classdesc Represents an interface for classic CRUD operations on the device's local storage
	* Used in a Strategy pattern to uncouple app core from concrete storage solution used.
	* Note: Storage entries are exchanged as json objects; concrete implementations convert
	* this to whatever the storage solution requires.
	* Note: It is the responsibility of the client/caller to handle any errors caused by
	* CRUD operations conflicting with the current state in storage (e.g. updating a non-
	* existing item).
*/

export interface LocalStoreable {
	/** Creates a new entry in local storage
	 * @return The storage key of the written object (in callback)
	 */
	create(object: Serializable): Promise<number>;

	/** Retrieves an entry from local storage
	 * @return The object being retreived (in callback)
	 */
	retrieve(object: Serializable, key?: number): Promise<any>;

	/** Updates an entry in local storage
	 * @return The storage key of the updated object (in callback)
	 */
	update(object: Serializable): Promise<number>;

	/** Deletes an entry from local storage
	 * @return The deleted object (in callback)
	 */
	delete(object: Serializable, key?: number): Promise<any>;

	/** Resets indexedDB, removing all items from storage */
	clear(): Promise<boolean>;

	/** Gets every item from local storage in a structured (default) or flattened collection
	 * @param {Boolean} flatten If true, objects from all stores are returned in a flattened collection
	 * @returm {Object} Object literal holding copy of all data in storage   
	 */
	getAll(flatten: boolean): Promise<any>;
}