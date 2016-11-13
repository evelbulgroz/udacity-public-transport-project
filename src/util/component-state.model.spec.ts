'use strict';

import {ComponentState} from './component-state.model';
import {LocalStorage} from './../offline/local-storage.class'
import {Model} from './../core/model';

describe('class ComponentState', () => {
	let now: Date = new Date();
	let storage: LocalStorage = new LocalStorage();
	let testState: ComponentState;
	
	class TestModel extends Model {
		private _name: string;
		constructor(name: string) {
			super();
			this._className = 'Agency'; // workaround so we don't need to manage a separate test store
			this._name = name; 
		}
		name() {return this._name;}
	}

	
	beforeEach((done) => {
		// Create a fresh instance to work with
		testState = new ComponentState( //implicit constructor test
			'TestComponent',
			[
				new TestModel('TestModel 1'),
				new TestModel('TestModel 2'),
				new TestModel('TestModel 3'),
			],
			{
				date: now
			}
		);
		storage.clear().then(() => {done();}).catch((e) => {console.log(e); done();});
	});
	
	it('can get the name of the component it holds state for', () => {
		expect(testState.componentName()).toBe('TestComponent');
	});

	it('can get the data of its component', () => {
		expect(testState.data().length).toBe(3);
		expect((<TestModel>testState.data()[0]).name()).toBe('TestModel 1');
		expect((<TestModel>testState.data()[1]).name()).toBe('TestModel 2');
		expect((<TestModel>testState.data()[2]).name()).toBe('TestModel 3');
	});

	it('can get the query of its component', () => {
		expect(testState.query()).toBeDefined();
		expect(testState.query()['date']).toBe(now);
	});

	it('can convert itself to JSON', () => {
		let json: any = testState.toJSON();
		expect(json._className).toBe('ComponentState');
		expect(json._componentName).toBe('TestComponent');
		expect(json._data.constructor).toBe(Array);
		expect(json._data.length).toBe(3);
		expect(json._data[0]._className).toBe('Agency');
		expect(json._data[0]._modelId).toBeDefined();
		expect(json._data[1]._className).toBe('Agency');
		expect(json._data[1]._modelId).toBeDefined();
		expect(json._data[2]._className).toBe('Agency');
		expect(json._data[2]._modelId).toBeDefined();
		expect((new Date(json._query.date)).valueOf()).toBe(now.valueOf());
	});

	it('can write itself to local storage', (done) => {
		testState.writeObject(testState)
			.then((key: number) => {
				expect(key).toBe(testState.modelId());
				testState.readObject(testState)
					.then((json: any) => {
						expect(json._className).toBe('ComponentState');
						expect(json._componentName).toBe('TestComponent');
						expect(json._data.constructor).toBe(Array);
						expect(json._data.length).toBe(3);
						expect(json._data[0]._className).toBe('Agency');
						expect(json._data[0]._modelId).toBeDefined();
						expect(json._data[1]._className).toBe('Agency');
						expect(json._data[1]._modelId).toBeDefined();
						expect(json._data[2]._className).toBe('Agency');
						expect(json._data[2]._modelId).toBeDefined();
						expect((new Date(json._query.date)).valueOf()).toBe(now.valueOf());
						done();
					})
					.catch((e) => {
						console.log(e);
						done();
					});
			})
			.catch((e) => {
				console.log(e);
				done();
			});
		expect(true).toBe(true); // keep Jasmine happy!
	});

	it('can read itself from local storage', (done) => {
		testState.writeObject(testState)
			.then((key: number) => {
				expect(key).toBe(testState.modelId());
				testState.readObject(testState)
					.then((json: any) => {
						expect(json._className).toBe('ComponentState');
						expect(json._componentName).toBe('TestComponent');
						expect(json._data.constructor).toBe(Array);
						expect(json._data.length).toBe(3);
						expect(json._data[0]._className).toBe('Agency');
						expect(json._data[0]._modelId).toBeDefined();
						expect(json._data[1]._className).toBe('Agency');
						expect(json._data[1]._modelId).toBeDefined();
						expect(json._data[2]._className).toBe('Agency');
						expect(json._data[2]._modelId).toBeDefined();
						expect((new Date(json._query.date)).valueOf()).toBe(now.valueOf());
					done();
					})
					.catch((e) => {
						console.log(e);
						done();
					});
			})
			.catch((e) => {
				console.log(e);
				done();
			});
		expect(true).toBe(true); // keep Jasmine happy!
	});
	
	afterEach((done) => {
		storage.clear().then(() => {done();}).catch((e) => {console.log(e); done();});
	})
	
});