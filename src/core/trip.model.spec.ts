'use strict';

import {Route} from './route.model';
import {StopTime} from './stop-time.model';
import {Trip} from './trip.model';

describe('model Trip', () => {
	let testTrip: Trip;

	class TestTrip extends Trip {
		public constructor(
			apiId: string,
			name: string,
			direction: boolean,
			cancelled: boolean = false,
			route?: Route,
			iconUrl?: string,
			iconAltText?: string
		) {
			super(apiId, name, direction, cancelled, route, iconUrl, iconAltText);
			this._type = '1';
		}
		public details(): any { // dummy method to satisfy interface
			return {};
		}
	}

	beforeEach(() => {
		testTrip = new TestTrip('2', 'test trip', true, true, new Route('66', 'test route', 4));
	});
		
	it('has an id', () => {
		expect(testTrip.apiId()).toBe('2');
	});

	it('has a name', () => {
		expect(testTrip.name()).toBe('test trip');
	});

	it('has a collection of Notes that is empty by default', () => {
		expect(testTrip.notes().length).toBe(0);
	});

	it('has a direction', () => {
		expect(testTrip.direction()).toBe(true);
	});

	it('knows if it is cancelled', () => {
		expect(testTrip.cancelled()).toBe(true); // get
		expect(testTrip.cancelled(false)).toBe(false); // set
	});

	it('has a Route', () => {
		expect(testTrip.route().apiId()).toBe('66');
	});

	it('has a collection of stops (StopTimes) that is empty by default', () => {
		expect(testTrip.stopTimes().length).toBe(0);
	});

	it('can add an item to its collection of Notes', () => {
		expect(testTrip.notes().length).toBe(0);
		testTrip.addNote({text: 'note text', from: 0, to: 5});
		expect(testTrip.notes().length).toBe(1);
		expect(testTrip.notes()[0].text).toBe('note text');
		expect(testTrip.notes()[0].from).toBe(0);
		expect(testTrip.notes()[0].to).toBe(5);
	});

	it('can add an item to its collection of stops (StopTimes)', () => {
		expect(testTrip.stopTimes().length).toBe(0);
		testTrip.addStopTime(new StopTime('34', 0));
		expect(testTrip.stopTimes().length).toBe(1);
		expect(testTrip.stopTimes()[0].apiId()).toBe('34');
	});

	xit('can get an item from its collection of stops (StopTimes) by stop name', () => {
		
	});
	
	it('can convert itself to JSON', () => {
		let json: any = testTrip.toJSON();
		expect(json._apiId).toBe('2');
		expect(json._cancelled).toBe(true);
		expect(json._className).toBe('Trip');
		expect(json._direction).toBe(true);
		expect(json._name).toBe('test trip');
		expect(json._modelId).toBe(testTrip.modelId());
		expect(json._route._className).toBe('Route');
		expect(json._route._modelId).toBe(testTrip.route().modelId());
		expect(json._type).toBe('1');
	});

	afterEach(() => {
		testTrip = undefined;
	});
});