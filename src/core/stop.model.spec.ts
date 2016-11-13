'use strict';

import {LatLng} from './latlng.model';
//mport {Place} from './place.model';
import {Stop} from './stop.model';

describe('model Stop', () => {
	let testStop: Stop;

	beforeEach(() => {
		testStop = new Stop('008600053', 'Aarhus H', new LatLng(10204761, 56150444), false);
	});
		
	it('has an id', () => {
		expect(testStop.apiId()).toBe('008600053');
	});

	it('has a name', () => {
		expect(testStop.name()).toBe('Aarhus H');
	});

	it('has a location', () => {
		expect(testStop.location().lat()).toBe(10204761);
		expect(testStop.location().lng()).toBe(56150444);
	});

	it('knows if it is a station (i.e. providing multiple stops)', () => {
		expect(testStop.isStation()).toBe(false);
	});

	it('can convert itself to JSON', () => {
		let json = testStop.toJSON();
		expect(json._apiId).toBe('008600053');
		expect(json._isStation).toBe(false);
		expect(json._location._lat).toBe(10204761);
		expect(json._location._lng).toBe(56150444);
		expect(json._name).toBe('Aarhus H');
	});

	afterEach(() => {
		testStop = undefined;
	});
});