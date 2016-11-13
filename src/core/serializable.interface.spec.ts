'use strict';

import {Agency} from './../core/agency.model';
import {LatLng} from './../core/latlng.model';
import {LocalStorage} from'./../offline/local-storage.class';
import {Serializable} from './../core/serializable.interface';
import {Stop} from './../core/stop.model';
import {StopTime} from './../core/stop-time.model';

describe('interface Serializable', () => {
	let testObject: Agency;
	let testStorage: LocalStorage;

	beforeEach((done) => {
		testObject = new Agency('apiId', 'Test Agency', 'test-icon.png', 'Test Icon');
		testStorage = new LocalStorage();

		testStorage.clear() // make sure storage is empty before each test
			.then(() => {   // this will remove all app data; run tests in separate browser to keep data
				done();
			})
			.catch((e) => {
				console.log(e);
				done();
			});

		/*
		testObject.removeObject(testObject) // make sure test object is cleared from storage before each test
			.then(() => {
				done();
			})
			.catch((e) => {
				console.log(e);
				done();
			});
		*/
	});
	
	describe('default methods', () => {
		it('can write a new serializable to local storage', (done) => {
			testObject.readObject(testObject)
				.then((json: any) => {
					expect(json).not.toBeDefined(); // verify that storage is clear
					testObject.writeObject(testObject)
						.then((key: number) => {
							expect(key).toBe(testObject.modelId()); //verify that returned storage key is modelId
							testObject.readObject(testObject)
								.then((json: any) => { // verify that data survives roundtrip to/from storage
									expect(json._apiId).toBe('apiId');
									expect(json._className).toBe('Agency');
									expect(json._iconAltText).toBe('Test Icon');
									expect(json._iconUrl).toBe('test-icon.png');
									expect(json._modelId).toBe(testObject.modelId());
									expect(json._name).toBe('Test Agency');
									done();
								})
						})
				})
				.catch((e) => {
					console.log(e);
					done();
				})
			expect(true).toBe(true); // keep Jasmine happy!
		});
	
		it('can read in a serializable\'s state from local storage', (done) => {
			let now: Date = new Date();
			let testObject = new StopTime('stopTimeId', 1, now);
			let testStop: Stop =  testObject.stop(new Stop('stopId', 'Aarhus H', new LatLng(23.5753, 65.2423)));
			testObject.readObject(testObject)
				.then((serializable: Serializable) => {
					expect(serializable).not.toBeDefined(); // verify that object a cleared from storage
					expect(testObject.arrivalActual(now)).toBe(now); // change some attributes
					expect(testObject.departureActual(now)).toBe(now);
					expect(testObject.stop().name('Odense')).toBe('Odense');
					testObject.writeObject(testObject) // write to storage
						.then((key: number) => {
							expect(key).toBe(testObject.modelId());
							testObject.readObject(testObject)
								.then((serializable: StopTime) => { // verify write
									expect(serializable.className()).toBe(testObject.className());
									expect(serializable.modelId()).toBe(testObject.modelId());
									expect(serializable.stop().className()).toBe(testStop.className());
									expect(serializable.stop().modelId()).toBe(testStop.modelId());
									expect(serializable.arrivalActual()).toEqual(now); // verify overwrites from storage
									expect(serializable.departureActual()).toEqual(now);
									expect((<any>serializable.stop())._className).toBe('Stop');
									expect((<any>serializable.stop())._modelId).toBeDefined();
									done();
								});
						});
				})
				.catch((e) => {
					console.log(e);
					done();
				})
			expect(true).toBe(true); // keep Jasmine happy!
		});

		it('can update an existing serializable in local storage', (done) => {
			testObject.readObject(testObject)
				.then((json: any) => {
					expect(json).not.toBeDefined(); // verify that storage is clear
					testObject.writeObject(testObject)
						.then((key: number) => {
							expect(key).toBe(testObject.modelId()); // verify that returned storage key is modelId
							testObject.readObject(testObject)
								.then((json: any) => { // verify that data has been stored correctly
									expect(json._apiId).toBe('apiId');
									expect(json._className).toBe('Agency');
									expect(json._iconAltText).toBe('Test Icon');
									expect(json._iconUrl).toBe('test-icon.png');
									expect(json._modelId).toBe(testObject.modelId());
									expect(json._name).toBe('Test Agency');
									void testObject.iconAltText('Changed Test Icon');
									void testObject.iconUrl('changed-icon.jpg');
									testObject.writeObject(testObject)
										.then((key: any) => {
											expect(key).toBe(testObject.modelId()); // verify that returned storage key is modelId
											testObject.readObject(testObject)
												.then((json: any) => { // verify that data has been stored correctly
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
				.catch((e) => {
					console.log(e);
					done();
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});
	
		it('can remove a serializable from local storage', (done) => {
			testObject.readObject(testObject)
				.then((json: any) => {
					expect(json).not.toBeDefined(); // verify that storage is clear
					testObject.writeObject(testObject)
						.then((key: number) => {
							expect(key).toBe(testObject.modelId()); //verify that returned storage key is modelId
							testObject.removeObject(testObject)
								.then((json: any) => { // verify that return is valid copy of data
									expect(json._apiId).toBe('apiId');
									expect(json._className).toBe('Agency');
									expect(json._iconAltText).toBe('Test Icon');
									expect(json._iconUrl).toBe('test-icon.png');
									expect(json._modelId).toBe(testObject.modelId());
									expect(json._name).toBe('Test Agency');
									testObject.readObject(testObject)
										.then((json: any) => {
											expect(json).not.toBeDefined() // verify that item has been removed from storage
											done();
										})

								})
						})
				})
				.catch((e) => {
					console.log(e);
					done();
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});
	});
	
	afterEach((done) => {
		testStorage.clear() // make sure storage is empty before each test
			.then(() => {   // this will remove all app data; run tests in separate browser to keep data
				done();
			})
			.catch((e) => {
				console.log(e);
				done();
			});
		/*
		testObject.removeObject(testObject)
		.then(() => {
			testObject = undefined;
			done();
		})
		.catch((e) => {
			console.log(e);
			testObject = undefined;
			done();
		});
		*/
	});
});