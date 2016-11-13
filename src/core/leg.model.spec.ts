'use strict';

import {Leg} from './leg.model';
import {StopTime} from './stop-time.model';
import {Trip} from './trip.model';

describe('model Leg', () => {
	let testLeg: Leg;

	class TestTrip extends Trip {
		constructor(id: string, name: string, direction: boolean) {
			super(id, name, direction);
		}
		public details() {}
	}

	beforeEach(() => {
		testLeg = new Leg(
			new StopTime('origin'),
			new StopTime('destination'),
			'detailsUrl',
			[{text: 'notes', from: 0, to: 0}]
		);
		void testLeg.origin().trip(new TestTrip('tripId', undefined, false))
	});
	
	it('can look up its trip', () => {
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

	it('can convert itself to JSON', () => {
		expect(testLeg.toJSON).toBeDefined();
		let json: any = testLeg.toJSON();
		expect(json._apiId).toBe(testLeg.apiId());
		expect(json._className).toBe('Leg');
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