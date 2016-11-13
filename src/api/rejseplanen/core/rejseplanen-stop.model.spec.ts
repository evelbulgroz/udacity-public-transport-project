'use strict';

import {LatLng} from './../../../core/latlng.model';
import {RejseplanenStop} from './rejseplanen-stop.model';
import {LocationList} from './../locationsearch/rejseplanen-location.mock';

describe('model RejseplanenStop', () => {
	let testStop: RejseplanenStop;

	beforeEach(() => {
		testStop = new RejseplanenStop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
	});
		
	it('has an id', () => {
		expect(testStop.apiId()).toBe('008600053');
	});

	it('has a name', () => {
		expect(testStop.name()).toBe('Aarhus H');
	});

	it('has a location', () => {
		expect(testStop.location().lat()).toBe(10.204761);
		expect(testStop.location().lng()).toBe(56.150444);
	});

	it('knows if it is a station (i.e. providing multiple stops)', () => {
		expect(testStop.isStation()).toBe(false);
	});

	it('has a product name', () => {
		expect(testStop.productName()).toBe('RejseplanenStop');
	});

	it('can parse API JSON into an object model structure', () => {
		testStop = RejseplanenStop.prototype.createProduct(LocationList.StopLocation[0]);
		expect(testStop.apiId()).toBe('008600053');
		expect(testStop.name()).toBe('Aarhus H');
		expect(testStop.location().lat()).toBe(10.204761);
	});

	it('can convert itself to JSON', () => {
		let json = testStop.toJSON();
		expect(json._apiId).toBe('008600053');
		expect(json._className).toBe('RejseplanenStop');
		expect(json._isStation).toBe(false);
		expect(json._location._lat).toBe(10.204761);
		expect(json._location._lng).toBe(56.150444);
		expect(json._modelId).toBe(testStop.modelId());
		expect(json._name).toBe('Aarhus H');
	});

	afterEach(() => {
		testStop = undefined;
	});
});