'use strict';

import {RejseplanenRoute} from './rejseplanen-route.model';
import {RejseplanenTrip} from './rejseplanen-trip.model';
import {StopTime} from './../../../core/stop-time.model';
import {TripList} from './../journeyplanner/rejseplanen-journey.mock';

describe('model RejseplanenTrip', () => {
	let testTrip: RejseplanenTrip;

	beforeEach(() => {
		testTrip = new RejseplanenTrip(
			'2',
			'test trip',
			false,
			true,
			new RejseplanenRoute('66', 'test route', 4),
			'details url',
			'icon url',
			'icon alt text'
			);
		void testTrip.type('1');
	});
		
	it('has an id', () => {
		expect(testTrip.apiId()).toBe('2');
	});

	it('has a name', () => {
		expect(testTrip.name()).toBe('test trip');
	});

	it('has a direction', () => {
		expect(testTrip.direction()).toBe(false);
	});

	it('knows if it is cancelled', () => {
		expect(testTrip.cancelled()).toBe(true); // get
		expect(testTrip.cancelled(false)).toBe(false); // set
	});

	it('has a Route', () => {
		expect(testTrip.route().apiId()).toBe('66');
	});

	it('has a collection of stops (StopTimes)', () => {
		expect(testTrip.stopTimes().length).toBe(0);
	});

	it('can add an item to its collection of stops (StopTimes)', () => {
		expect(testTrip.stopTimes().length).toBe(0);
		testTrip.addStopTime(new StopTime('34', 0));
		expect(testTrip.stopTimes().length).toBe(1);
		expect(testTrip.stopTimes()[0].apiId()).toBe('34');
	});

	it('has a product name', () => {
		expect(testTrip.productName()).toBe('RejseplanenTrip');
	});

	it('can parse API JSON into an object model structure', () => {
		// Dummy method to satisfy ITransitAPIProduct
		// Just check type
		testTrip = RejseplanenTrip.prototype.createProduct(TripList.Trip[0]);
		expect(testTrip instanceof RejseplanenTrip).toBe(true);
	});

	it('can convert itself to JSON', () => {
		let json: any = testTrip.toJSON();
		expect(json._apiId).toBe('2');
		expect(json._cancelled).toBe(true);
		expect(json._className).toBe('RejseplanenTrip');
		expect(json._detailsUrl).toBe('details url');
		expect(json._direction).toBe(false);
		expect(json._iconAltText).toBe('icon alt text');
		expect(json._iconUrl).toBe('icon url');
		expect(json._name).toBe('test trip');
		expect(json._modelId).toBe(testTrip.modelId());
		expect(json._route._className).toBe('RejseplanenRoute');
		expect(json._route._modelId).toBe(testTrip.route().modelId());
		expect(json._type).toBe('1');
	});

	afterEach(() => {
		testTrip = undefined;
	});
});