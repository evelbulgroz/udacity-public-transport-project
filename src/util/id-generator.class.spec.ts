'use strict';

import {IdGenerator} from './id-generator.class';

describe('class IdGenerator', () => {
	let testGenerator: IdGenerator;
	beforeEach(() => {
		testGenerator = IdGenerator.getInstance();
	});

	it('is a singleton', () => {
		expect(testGenerator.constructor).toBe(IdGenerator);
		expect(testGenerator).toEqual(IdGenerator.getInstance());
	});

	it('can generate a random number of unique ids', () => {
		let ids: Array<any> = [];
		let exists: boolean;
		let newId: any;
		
		for (let i = 0; i < Math.round(Math.random() * 1000 + 50); i++) {
			newId = testGenerator.getUniqueId();
			exists = false;
			ids.forEach((id: any) => {exists = exists || newId === id;})
			if (!exists) {
				void ids.push(newId)
			}
			else {
				expect(exists).toBe(false);
			}		
		}
		expect(true).toBe(true); // keep Jasmine happy!

	});

	afterEach(() => {
		testGenerator = undefined;
	});
});