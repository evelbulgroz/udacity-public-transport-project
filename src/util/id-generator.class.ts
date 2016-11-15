'use strict';

/** @classdesc Utility class for generating unique Model ids internal to app.
 * Singleton, so has no public constructor, use getInstance() class method instead. 
 */
export class IdGenerator {
	private static instance: IdGenerator;
	private static nextId: number = 0;
	
	private constructor() {}
	
	static getInstance(): IdGenerator {
		return IdGenerator.instance || (IdGenerator.instance = new IdGenerator());
	}

	public getUniqueId(): number {
		return IdGenerator.nextId++;
	}
}