import {Serializable} from './../core/serializable.interface';

/* Sequences Promises by recursing through provided collection,
 * applying iterator to each item in collection.
 * Lightweight, custom implementation of more generic Promise.each().
 * Iterator signature is iterator(item: any, recurse: boolean).
 * @param {Array} collection Promises to be resolved for sequentially
 * @param {String | Function} iterator Function to call on each item. If string, assumed to be property of item (or prototype)
 * @param {Boolean} recurse Flag deciding whether to perform iterator recursively (default is true)
 * @return {Promise} Holding a collection of every processed item
 */
export function promiseEach(collection: Array<Serializable>, iterator: string | Function, recurse: boolean = true): Promise<Map<number, any>> {
	return new Promise((resolve: Function, reject: Function) => {
		let items: Array<Serializable> = collection.slice(); // clone item collection
		let doneItems: Map<number, any> = new Map<number, any>();
		function _iterate(items: Array<any>): void { // can't plain iterate with async, so recursing
			let item: any = items.pop();
			if (typeof iterator === 'string') {
				item[<string>iterator].call(item, item, recurse)
					.then(() => {
						doneItems.set(item.modelId(), item);
						if (items.length > 0) {
							_iterate(items);
						}
						else {
							resolve(doneItems); // exit recursion and resolve Promise
						}
					})
					.catch((e: any) => {
						reject(e);
					})
			}
			else {
				iterator(item, recurse)
					.then(() => {
						doneItems.set(item.modelId(), item);
						if (items.length > 0) {
							_iterate(items);
						}
						else {
							resolve(doneItems); // exit recursion and resolve Promise
						}
					})
					.catch((e: any) => {
						reject(e);
					})
			}
		}
		if (items.length) {
			_iterate(items);
		}
		else {
			resolve(undefined);
		}
	})
}
