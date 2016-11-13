'use strict';

import {Agency} from'./agency.model';
import {Route} from'./route.model';
import {Trip} from './trip.model';

describe('model Route', () => {
	let testRoute: Route;

	class TestTrip extends Trip {
		public details(): any {
			return {};
		}
	}
	
	beforeEach(() => {
		testRoute = new Route('2', 'B', 1, 'route_icon.png', 'Route icon');
		void testRoute.agency(new Agency('', 'test agency'));
		void testRoute.addTrip(new TestTrip('1', 'testTrip 1', false));
	});
	
	it('has an id', () => {
		expect(testRoute.apiId()).toBe('2');
	});

	it('has a name', () => {
		expect(testRoute.name()).toBe('B');
	});

	it('has a collection of Trips', () => {
		expect(testRoute.trips().length).toBe(1);
	});

	it('can add a Trip to its collection', () => {
		expect(testRoute.trips().length).toBe(1);
		testRoute.addTrip(new TestTrip('2', 'testTrip 2', false));
		expect(testRoute.trips().length).toBe(2);
		expect(testRoute.trips()[1].name()).toBe('testTrip 2');
	});

	it('can get an item from its collection of Trips by trip name', () => {
		expect(testRoute.trips().length).toBe(1);
		expect(testRoute.getTripByName('testTrip 1')).toBeDefined();
		expect(testRoute.getTripByName('testTrip 1').apiId()).toBe('1');
	});

	it('has a type', () => {
		expect(testRoute.type()).toBe(1); // get
		expect(testRoute.type(2)).toBe(2); // set
	});

	it('has a shared (static) list of route types', () => {
		expect(Route.types().lightrail).toBe(0);
	});

	it('has an icon url', () => {
		expect(testRoute.iconUrl()).toBe('route_icon.png'); // get
		expect(testRoute.iconUrl('another-icon.png')).toBe('another-icon.png'); // set
	});

	it('has an icon alt text', () => {
		expect(testRoute.iconAltText()).toBe('Route icon'); // get
		expect(testRoute.iconAltText('Some other icon alt text')).toBe('Some other icon alt text'); // set
	});

	it('has an agency', () => {
		expect(testRoute.agency().name()).toBe('test agency'); // get
		expect(testRoute.agency(new Agency('', 'another agency')).name()).toBe('another agency'); // set
	});
	
	it('can convert itself to JSON', () => {
		expect(testRoute.toJSON).toBeDefined();
		let json: any = testRoute.toJSON();
		expect(json._agency).toBeDefined();
		expect(json._agency._className).toBeDefined();
		expect(json._agency._modelId).toBeDefined();
		expect(json._apiId).toBe('2');
		expect(json._className).toBe('Route');
		expect(json._iconUrl).toBe('route_icon.png');
		expect(json._iconAltText).toBe('Route icon');
		expect(json._name).toBe('B');
		expect(json._modelId).toBe(testRoute.modelId());
		expect(json._trips).toBeDefined();
		expect(json._trips.constructor).toBe(Array);
		expect(json._trips[0]._className).toBe('Trip');
		expect(json._trips[0]._modelId).toBeDefined();
	});

	afterEach(() => {
		testRoute = undefined;
	});
});