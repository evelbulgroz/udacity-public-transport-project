'use strict';

import {RejseplanenAgency} from './rejseplanen-agency.model';
import {RejseplanenRoute} from './rejseplanen-route.model';
import {DepartureBoard} from './../departures/rejseplanen-departures.mock';

describe('model RejseplanenAgency', () => {
	let testAgency: RejseplanenAgency;
	
	beforeEach(() => {
		testAgency = new RejseplanenAgency('2', 'Test Agency', 'agency_icon.png', 'Agency icon');
	});
	
	it('has an API id', () => {
		expect(testAgency.apiId()).toBe('2');
	});

	it('has a name', () => {
		expect(testAgency.name()).toBe('Test Agency');
	});

	it('has a collection of Routes', () => {
		expect(testAgency.routes().length).toBe(0);
	});

	it('can add a Route to its collection', () => {
		expect(testAgency.routes().length).toBe(0);
		testAgency.addRoute(new RejseplanenRoute('1', 'Test Route', 1));
		expect(testAgency.routes().length).toBe(1);
		expect(testAgency.routes()[0].name()).toBe('Test Route');		
		expect(testAgency.routes()[0].agency()).toBe(testAgency);
	});

	it('can get an item from its collection of Routes by route name', () => {
		expect(testAgency.routes().length).toBe(0);
		testAgency.addRoute(new RejseplanenRoute('1', 'testTrip', 1));
		expect(testAgency.getRouteByName('testTrip')).toBeDefined();
		expect(testAgency.getRouteByName('testTrip').apiId()).toBe('1');
	});

	it('has an icon url', () => {
		expect(testAgency.iconUrl()).toBe('agency_icon.png'); // get
		expect(testAgency.iconUrl('some-other-icon.png')).toBe('some-other-icon.png'); // set
	});

	it('has an icon alt text', () => {
		expect(testAgency.iconAltText()).toBe('Agency icon'); // get
		expect(testAgency.iconAltText('Some other icon alt text')).toBe('Some other icon alt text'); // set
	});

	it('has a product name', () => {
		expect(testAgency.productName()).toBe('RejseplanenAgency');
	});

	it('can parse API JSON into an object model structure', () => {
		testAgency = RejseplanenAgency.prototype.createProduct(DepartureBoard.Departure[0]);
		
		expect(testAgency.apiId()).not.toBeDefined();
		expect(testAgency.name()).toBe('S-tog');
		expect(testAgency.iconUrl()).toBe('images/api-rejseplanen-agency-stog.png');
		expect(testAgency.iconAltText()).toBe('S-tog');

		testAgency = RejseplanenAgency.prototype.createProduct(DepartureBoard.Departure[2]);
		expect(testAgency.apiId()).not.toBeDefined();
		expect(testAgency.name()).toBe('DSB');
		expect(testAgency.iconUrl()).toBe('images/api-rejseplanen-agency-dsb.png');
		expect(testAgency.iconAltText()).toBe('DSB');

		testAgency = RejseplanenAgency.prototype.createProduct(DepartureBoard.Departure[3]);
		expect(testAgency.apiId()).not.toBeDefined();
		expect(testAgency.name()).toBe('DSB');
		expect(testAgency.iconUrl()).toBe('images/api-rejseplanen-agency-dsb.png');
		expect(testAgency.iconAltText()).toBe('DSB');

		testAgency = RejseplanenAgency.prototype.createProduct(DepartureBoard.Departure[6]);
		expect(testAgency.apiId()).not.toBeDefined();
		expect(testAgency.name()).toBe('DSB');
		expect(testAgency.iconUrl()).toBe('images/api-rejseplanen-agency-dsb.png');
		expect(testAgency.iconAltText()).toBe('DSB');

		testAgency = RejseplanenAgency.prototype.createProduct(DepartureBoard.Departure[20]);
		expect(testAgency.apiId()).not.toBeDefined();
		expect(testAgency.name()).toBe('Metro');
		expect(testAgency.iconUrl()).toBe('images/api-rejseplanen-agency-metro.png');
		expect(testAgency.iconAltText()).toBe('Metro');
	});

	it('can convert itself to JSON', () => {
		expect(testAgency.toJSON).toBeDefined();
		let json: any = testAgency.toJSON();
		expect(json._apiId).toBe('2');
		expect(json._className).toBe('RejseplanenAgency');
		expect(json._iconUrl).toBe('agency_icon.png');
		expect(json._iconAltText).toBe('Agency icon');
		expect(json._name).toBe('Test Agency');
		expect(json._modelId).toBeDefined();
	});

	afterEach(() => {
		testAgency = undefined;
	});
});