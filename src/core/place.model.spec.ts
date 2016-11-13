'use strict';

import {LatLng} from './latlng.model';
import {Place} from './place.model';

describe('model Place', () => {
	let testPlace: Place;

	beforeEach(() => {
		testPlace = new Place('008600053', 'Aarhus H', new LatLng(10204761, 56150444));
	});
		
	it('has an id', () => {
		expect(testPlace.apiId()).toBe('008600053');
	});

	it('has a name', () => {
		expect(testPlace.name()).toBe('Aarhus H');
	});

	it('has a location', () => {
		expect(testPlace.location().lat()).toBe(10204761);
		expect(testPlace.location().lng()).toBe(56150444);
	});

	it('can convert itself to JSON', () => {
		let json = testPlace.toJSON();
		expect(json._apiId).toBe('008600053');
		expect(json._className).toBe('Place');
		expect(json._location._lat).toBe(10204761);
		expect(json._location._lng).toBe(56150444);
		expect(json._modelId).toBe(testPlace.modelId());
		expect(json._name).toBe('Aarhus H');
	});

	afterEach(() => {
		testPlace = undefined;
	});
});