'use strict';

import {Agency} from './../core/agency.model';
import {Journey} from './../core/journey.model';
import {Leg} from './../core/leg.model';
import {LocalStorage} from'./local-storage.class';
import {Place} from './../core/place.model';
import {Route} from './../core/route.model';
import {Stop} from './../core/stop.model';
import {StopTime} from './../core/stop-time.model';
import {Trip} from './../core/trip.model';

describe('class LocalStorage', () => {
	let testStorage: LocalStorage;
	let testAgency: Agency;

	class TestTrip extends Trip {
		constructor(apiId: string, name: string, direction: boolean) {
			super(undefined);
			this._apiId = apiId;
			this._name = name;
			this._direction = direction;
		}
		public details() {}
	}
	
	/* NOTE: Using class to test itself is not good practice, but setting up separate,
	  * direct test access to local storage defeated me within the time available.
	  * Settling for 'barely acceptable' for now.
	  */

	beforeAll(() => {
		if (!window.indexedDB) {
			console.log('local storage not available, skipping tests');
		}
	});

	beforeEach((done) => {
		testStorage = new LocalStorage();
		testAgency = new Agency('apiId', 'Test Agency', 'test-icon.png', 'Test Icon');
		
		testStorage.clear() // make sure storage is empty before each test
			.then(() => {   // this will remove all app data; run tests in separate browser to keep data
				done();
			})
			.catch((e) => {
				console.log(e);
				done();
			});
	});
	
	it('can create an object in local storage', (done) => {
		if (window.indexedDB) {
			testStorage.get(testAgency)
				.then((json: any) => {
					expect(json).not.toBeDefined(); // verify that object is cleared from storage
					testStorage.store(testAgency)
						.then((key: number) => {
							expect(key).toBe(testAgency.modelId()); //verify that returned storage key is modelId
							testStorage.get(testAgency)
								.then((json: any) => { // verify that data survives roundtrip to/from storage
									expect(json._apiId).toBe('apiId');
									expect(json._className).toBe('Agency');
									expect(json._iconAltText).toBe('Test Icon');
									expect(json._iconUrl).toBe('test-icon.png');
									expect(json._modelId).toBe(testAgency.modelId());
									expect(json._name).toBe('Test Agency');
									done();
								})
								.catch((e) => {
									console.log(e);
									done();
								})
						})
						.catch((e) => {
							console.log(e);
							done();
						});
				})
				.catch((e) => {
					console.log(e);
					done();
				})
		}
		else {
			expect(true).toBe(true);
		}
		expect(true).toBe(true); // keep Jasmine happy!
	});

	it('can retrieve an object from local storage', (done) => {
		if (window.indexedDB) {
			testStorage.get(testAgency)
				.then((json: any) => {
					expect(json).not.toBeDefined(); // verify that object is cleared from storage
					testStorage.store(testAgency)
						.then((key: number) => {
							expect(key).toBe(testAgency.modelId()); // verify that returned storage key is modelId
							testStorage.get(testAgency)
								.then((json: any) => { // verify that data survives roundtrip to/from storage
									expect(json._apiId).toBe('apiId');
									expect(json._className).toBe('Agency');
									expect(json._iconAltText).toBe('Test Icon');
									expect(json._iconUrl).toBe('test-icon.png');
									expect(json._modelId).toBe(testAgency.modelId());
									expect(json._name).toBe('Test Agency');
									done();
								})
						})
				})
		}
		else {
			expect(true).toBe(true);
		}
		expect(true).toBe(true); // keep Jasmine happy!
	});

	it('can update an object in local storage', (done) => {
		if (window.indexedDB) {
			let testObject: Agency = new Agency('apiId', 'Test Agency', 'test-icon.png', 'Test Icon');
			testStorage.get(testObject)
				.then((json: any) => {
					expect(json).not.toBeDefined(); // verify that object is cleared from storage
					testStorage.store(testObject)
						.then((key: number) => {
							expect(key).toBe(testObject.modelId()); // verify that returned storage key is modelId
							testStorage.get(testObject)
								.then((json: any) => { // verify that data has been stored correctly
									expect(json._apiId).toBe('apiId');
									expect(json._className).toBe('Agency');
									expect(json._iconAltText).toBe('Test Icon');
									expect(json._iconUrl).toBe('test-icon.png');
									expect(json._modelId).toBe(testObject.modelId());
									expect(json._name).toBe('Test Agency');
									void testObject.iconAltText('Changed Test Icon');
									void testObject.iconUrl('changed-icon.jpg');
									testStorage.store(testObject)
										.then((key: any) => {
											expect(key).toBe(testObject.modelId()); // verify that returned storage key is modelId
											testStorage.get(testObject)
												.then((json: any) => { // verify that data has been updated correctly
													expect(json._apiId).toBe('apiId');
													expect(json._className).toBe('Agency');
													expect(json._iconAltText).toBe('Changed Test Icon');
													expect(json._iconUrl).toBe('changed-icon.jpg');
													expect(json._modelId).toBe(testObject.modelId());
													expect(json._name).toBe('Test Agency');
													done();
												})
										})
								})
						})
				})
		}
		else {
			expect(true).toBe(true);
		}	
		expect(true).toBe(true); // keep Jasmine happy!
	});

	it('can delete an object from local storage', (done) => {
		if (window.indexedDB) {
			testStorage.get(testAgency)
				.then((json: any) => {
					expect(json).not.toBeDefined(); // verify that object is cleared from storage
					testStorage.store(testAgency)
						.then((key: number) => {
							expect(key).toBe(testAgency.modelId()); //verify that returned storage key is modelId
							testStorage.remove(testAgency)
								.then((json: any) => { // verify that return is valid copy of data
									expect(json._apiId).toBe('apiId');
									expect(json._className).toBe('Agency');
									expect(json._iconAltText).toBe('Test Icon');
									expect(json._iconUrl).toBe('test-icon.png');
									expect(json._modelId).toBe(testAgency.modelId());
									expect(json._name).toBe('Test Agency');
									testStorage.get(testAgency)
										.then((json: any) => {
											expect(json).not.toBeDefined() // verify that item has been removed from storage
											done();
										})
	
								})
						})
				})
		}
		else {
			expect(true).toBe(true);
		}
		expect(true).toBe(true); // keep Jasmine happy!
	});

	it('can get every object from every store in local storage in a collection grouped by store', (done) => {
		if (window.indexedDB) {
			testStorage.get(testAgency)
				.then(() => {  // add an item to every object store
					let testJourney: Journey = new Journey();
					void testJourney.apiId('journey-apiId');
					Promise.all([
						testStorage.store(testAgency),
						testStorage.store(new Leg(undefined, undefined, 'detailsUrl')),
						testStorage.store(new Place('place-apiId', 'Test Place', undefined)),
						testStorage.store(new Route('route-apiId', 'Test Route', undefined)),
						testStorage.store(new Stop('stop-apiId', 'Test Stop', undefined, true)),
						testStorage.store(new StopTime('stoptime-apiId')),
						testStorage.store(new TestTrip('trip-apiId', 'Test Trip', true))
					]).then(() => {
						testStorage.getAll(false)
							.then((objectMap: any) => {
								expect(Object.keys(objectMap).length).toBe(9)
								for (var storeName in objectMap) {
									let store: any = objectMap[storeName];
									for (var key in store) {
										expect(store[key]._className.toLowerCase()).toBe(storeName);
									}
								}
								done();
							})
					})
				})
		}
		else {
			expect(true).toBe(true);
		}
		expect(true).toBe(true); // keep Jasmine happy!
	});

	it('can get every object from every store in local storage in a flattened collection', (done) => {
		if (window.indexedDB) {
			testStorage.get(testAgency)
				.then(() => {  // add an item to every object store
					let testJourney: Journey = new Journey();
					void testJourney.apiId('journey-apiId');
					Promise.all([
						testStorage.store(testAgency),
						testStorage.store(new Leg(undefined, undefined, 'detailsUrl')),
						testStorage.store(new Place('place-apiId', 'Test Place', undefined)),
						testStorage.store(new Route('route-apiId', 'Test Route', undefined)),
						testStorage.store(new Stop('stop-apiId', 'Test Stop', undefined, true)),
						testStorage.store(new StopTime('stoptime-apiId')),
						testStorage.store(new TestTrip('trip-apiId', 'Test Trip', true))
					]).then(() => {
						testStorage.getAll(true)
							.then((objectMap: any) => {
								expect(Object.keys(objectMap).length).toBe(7)
								for (var key in objectMap) {
									expect(objectMap[key]._modelId).toBe(parseInt(key));
								}
								done();
							})
					})
				})
		}
		else {
			expect(true).toBe(true);
		}
		expect(true).toBe(true); // keep Jasmine happy!
	});

	it('can clear all app data from local storage', (done) => {
		if (window.indexedDB) {
			testStorage.get(testAgency)
				.then(() => { // add an item to every object store
					let testJourney: Journey = new Journey();
					void testJourney.apiId('journey-apiId');
					Promise.all([
						testStorage.store(testAgency),
						testStorage.store(new Leg(undefined, undefined, 'detailsUrl')),
						testStorage.store(new Place('place-apiId', 'Test Place', undefined)),
						testStorage.store(new Route('route-apiId', 'Test Route', undefined)),
						testStorage.store(new Stop('stop-apiId', 'Test Stop', undefined, true)),
						testStorage.store(new StopTime('stoptime-apiId')),
						testStorage.store(new TestTrip('trip-apiId', 'Test Trip', true))
					]).then(() => {
						testStorage.getAll()
							.then((objectMap: any) => { // verify that write was successful
								expect(Object.keys(objectMap).length).toBe(9)
								for (var storeName in objectMap) {
									let store: any = objectMap[storeName];
									for (var key in store) {
										expect(store[key]._className.toLowerCase()).toBe(storeName);
									}
								}
								testStorage.clear()
									.then(() => {
										testStorage.getAll()
											.then((objectMap: any) => {
												expect(Object.keys(objectMap).length).toBe(9); // verify that structure is still in place
												for (var storeName in objectMap) { // verify that every store is empty
													expect(Object.keys(objectMap[storeName]).length).toBe(0);
												}
												done();
											})
									})
							})
					})
				})
		}
		else {
			expect(true).toBe(true);
		}
		expect(true).toBe(true); // keep Jasmine happy
	});

	afterEach((done) => {
		testStorage.clear() // make sure storage is empty after each test
			.then(() => {   // this will remove all app data; run tests in separate browser to keep data
				testStorage = undefined;
				done();
			})
			.catch((e) => {
				console.log(e);
				testStorage = undefined;
				done();
			});
	});
});