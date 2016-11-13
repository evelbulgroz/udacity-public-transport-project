'use strict';

import {LatLng} from './latlng.model';

describe('model LatLng', () => {
	let testLocation: LatLng;
	
	beforeEach(() => {
		testLocation = new LatLng(10204761, 56150444);
	});
	
	it('has a latitude', () => {
		expect(testLocation.lat()).toBe(10204761);
	});

	it('has a longitude', () => {
		expect(testLocation.lng()).toBe(56150444);
	});

	it('can convert itself to JSON', () => {
		expect(testLocation.toJSON).toBeDefined();
		let json: any = testLocation.toJSON();
		expect(json._className).toBe('LatLng');
		expect(json._modelId).toBe(testLocation.modelId());
		expect(json._lat).toBe(10204761);
		expect(json._lng).toBe(56150444);
	});

	afterEach(() => {
		testLocation = undefined;
	});
});