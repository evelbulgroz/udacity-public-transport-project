'use strict';

import {Stop} from './stop.model';
import {StopTime} from './stop-time.model';
import {Trip} from './trip.model';

describe('model StopTime', () => {
	let testStopTime: StopTime,
		departure = new Date(),
		realtime_departure = new Date(departure.valueOf() + 3600000),
		arrival = new Date(),
		realtime_arrival = new Date(arrival.valueOf() + 3600000);

	class TestTrip extends Trip {
		public details(): any {
			return {};
		}

		public toJSON(): any {
			return {};
		}
	}

	beforeEach(() => {
		testStopTime = new StopTime('1',  1, departure, realtime_departure, '1', '2', arrival, realtime_arrival, '2', '3');
	});
	
	it('has an id', () => {
		expect(testStopTime.apiId()).toBe('1');
	});

	it('has a sequence number', () => {
		expect(testStopTime.sequence()).toBe(1);
	});

	it('has a planned departure', () => {
		expect(testStopTime.departurePlanned().valueOf()).toEqual(departure.valueOf());
	});

	it('has a real-time (actual) departure', () => {
		expect(testStopTime.departureActual().valueOf()).toEqual(realtime_departure.valueOf());
	});

	it('has a departure track (optional)', () => {
		expect(testStopTime.departureTrackPlanned()).toBe('1');
	});

	it('has a planned arrival', () => {
		expect(testStopTime.arrivalPlanned().valueOf()).toBe(arrival.valueOf());
	});

	it('has a real-time (actual) departure', () => {
		expect(testStopTime.arrivalActual().valueOf()).toEqual(realtime_arrival.valueOf());
	});

	it('has an arrival track (optional)', () => {
		expect(testStopTime.arrivalTrackPlanned()).toBe('2');
	});

	it('has a Stop', () => {
		expect(testStopTime.stop()).not.toBeDefined();
		expect(testStopTime.stop(new Stop('3', 'test stop', undefined)) instanceof Stop).toBe(true); // set
		expect(testStopTime.stop().name()).toBe('test stop'); // get
	});

	it('has a Trip', () => {
		expect(testStopTime.trip()).not.toBeDefined();
		expect(testStopTime.trip(new TestTrip('85', 'test trip', false)) instanceof Trip).toBe(true); // set
		expect(testStopTime.trip().name()).toBe('test trip'); // get
	});

	it('can convert itself to JSON', () => {
		void testStopTime.stop(new Stop('3', 'test stop', undefined));
		void testStopTime.trip(new TestTrip('85', 'test trip', false));
		expect(testStopTime.toJSON).toBeDefined();
		let json: any = testStopTime.toJSON();
		expect(json._apiId).toBe('1');
		expect(json._arrival_planned).toBe(arrival);
		expect(json._arrival_actual).toBe(realtime_arrival);
		expect(json._arrival_track).toBe('2');
		expect(json._className).toBe('StopTime');
		expect(json._departure_planned).toBe(departure);
		expect(json._departure_actual).toBe(realtime_departure);
		expect(json._departure_track).toBe('1');
		expect(json._modelId).toBe(testStopTime.modelId());
		expect(json._sequence).toBe(1);
		expect(json._stop._className).toBe(testStopTime.stop().className());
		expect(json._stop._modelId).toBe(testStopTime.stop().modelId());
		expect(json._trip._className).toBe(testStopTime.trip().className());
		expect(json._trip._modelId).toBe(testStopTime.trip().modelId());
	});

	afterEach(() => {
		testStopTime = undefined;
	});
});