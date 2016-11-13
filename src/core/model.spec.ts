'use strict';

import {Model} from './model';

// mock derived class
class ModelChild extends Model {
	constructor() {
		super();
		this._apiId = 'modelChild01';
		this._className = 'Place'; // workaround: using a pre-existing store we know exists
	}
} 

describe('model Model', () => {
	let testModel: Model;

	beforeEach(() => {
		testModel = new ModelChild();
	});

	it('has an API id', () => {
		expect(testModel.apiId).toBeDefined();
		expect(testModel.apiId('apiId')).toBe('apiId');
	});
	
	it('has a class name', () => {
		expect(testModel.className).toBeDefined();
		expect(testModel.className()).toBe('Place');
	});
		
	it('has a unique model id (internal to app)', () => {
		expect(testModel.modelId()).toBeDefined();
	});

	it('can read itself from local storage', () => {
		expect(testModel.readObject).toBeDefined();
	});

	it('can remove itself from local storage', () => {
		expect(testModel.removeObject).toBeDefined();
	});

	it('can write itself to local storage', (done) => {
		expect(ModelChild.prototype.writeObject).toBeDefined();
		testModel.writeObject(testModel)
			.then((id: number) => {
				expect(id).toBe(testModel.modelId());
				done();
			})
			.catch((e) => {
				console.log(e);
				done();
			});
	});

	it('can convert itself to JSON', () => {
		expect(testModel.toJSON).toBeDefined();
		expect(testModel.toJSON()._className).toBe('Place');
		expect(testModel.toJSON()._modelId).toBeDefined();
		expect(typeof testModel.toJSON()._modelId).toBe('number');
	});

	afterEach(() => {
		testModel = undefined;
	});
});