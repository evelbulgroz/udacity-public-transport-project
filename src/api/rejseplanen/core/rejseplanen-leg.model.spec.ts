'use strict';

import {RejseplanenLeg} from './rejseplanen-leg.model';
import {RejseplanenTrip} from './rejseplanen-trip.model';
import {StopTime} from './../../../core/stop-time.model';
import {TripList} from './../journeyplanner/rejseplanen-journey.mock';

describe('model RejseplanenLeg', () => {
	let testLeg: RejseplanenLeg;

	beforeEach(() => {
		testLeg = new RejseplanenLeg(
			new StopTime('origin'),
			new StopTime('destination'),
			'detailsUrl',
			[{text: 'notes', from: 0, to: 0}]
		);
		void testLeg.origin().trip(new RejseplanenTrip('tripId', undefined, false));
	});
	
	it('has a trip', () => {
		expect(testLeg.trip().apiId()).toBe('tripId');
	});

	it('has an origin', () => {
		expect(testLeg.origin().apiId()).toBe('origin');
	});
	
	it('has a destination', () => {
		expect(testLeg.destination().apiId()).toBe('destination');
	});

	it('has a details URL (optional)', () => {
		expect(testLeg.detailsUrl()).toBe('detailsUrl');
	});

	it('has notes', () => {
		expect(testLeg.notes()[0].text).toBe('notes');
	});

	it('has a product name', () => {
		expect(testLeg.productName()).toBe('RejseplanenLeg');
	});

	it('can parse API JSON into an object model structure', () => {
		testLeg = RejseplanenLeg.prototype.createProduct(TripList.Trip[0].Leg[0]);
		expect(testLeg.trip().name()).toBe('IC 68629');
		expect(testLeg.destination().stop().name()).toBe('Fredericia St.');
	});

	it('can convert itself to JSON', () => {
		expect(testLeg.toJSON).toBeDefined();
		let json: any = testLeg.toJSON();
		expect(json._apiId).toBe(testLeg.apiId());
		expect(json._className).toBe('RejseplanenLeg');
		expect(json._modelId).toBe(testLeg.modelId());
		expect(json._origin._modelId).toBe(testLeg.origin().modelId());
		expect(json._destination._modelId).toBe(testLeg.destination().modelId());
		expect(json._detailsUrl).toBe('detailsUrl');
		expect(json._notes[0].text).toBe('notes');
	});

	afterEach(() => {
		testLeg = undefined;
	});
});