'use strict';

import {LatLng} from './../../../core/latlng.model';
import {RejseplanenPlace} from './rejseplanen-place.model';
import {LocationList} from './../locationsearch/rejseplanen-location.mock';

describe('model RejseplanenPlace', () => {
	let testPlace: RejseplanenPlace;

	beforeEach(() => {
		testPlace = new RejseplanenPlace('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
	});
		
	it('has an id', () => {
		expect(testPlace.apiId()).toBe('008600053');
	});

	it('has a name', () => {
		expect(testPlace.name()).toBe('Aarhus H');
	});

	it('has a location', () => {
		expect(testPlace.location().lat()).toBe(10.204761);
		expect(testPlace.location().lng()).toBe(56.150444);
	});

	it('has a type', () => {
		expect(testPlace.type()).toBeUndefined();
		expect(testPlace.type('ADR')).toBe('ADR'); // set
		expect(testPlace.type()).toBe('ADR'); // get
	});

	it('can parse API JSON into an object model structure', () => {
		testPlace = RejseplanenPlace.prototype.createProduct(LocationList.CoordLocation[0]);
		expect(testPlace.name()).toBe('Aarhus Svømmehal, Hal, Aarhus');
		expect(testPlace.type()).toBe('POI');
		expect(testPlace.location().lat()).toBe(10.211323);
	});

	it('can convert itself to JSON', () => {
		void testPlace.type('ADR');
		let json = testPlace.toJSON();
		expect(json._apiId).toBe('008600053');
		expect(json._className).toBe('RejseplanenPlace');
		expect(json._location._lat).toBe(10.204761);
		expect(json._location._lng).toBe(56.150444);
		expect(json._modelId).toBe(testPlace.modelId());
		expect(json._name).toBe('Aarhus H');
		expect(json._type).toBe('ADR');
	});

	afterEach(() => {
		testPlace = undefined;
	});
});