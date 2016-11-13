'use strict';

import {RejseplanenAgency} from './rejseplanen-agency.model';
import {RejseplanenRoute} from './rejseplanen-route.model';
import {RejseplanenTrip} from './rejseplanen-trip.model';
import {Route} from './../../../core/route.model';
import {DepartureBoard} from './../departures/rejseplanen-departures.mock';

describe('model RejseplanenRoute', () => {
	let testRoute: RejseplanenRoute;

	class TestTrip extends RejseplanenTrip {
		public details(): any {
			return {};
		}
	}
	
	beforeEach(() => {
		testRoute = new RejseplanenRoute('2', 'B', 1, 'route_icon.png', 'Route icon');
		void testRoute.agency(new RejseplanenAgency('', 'test agency'));
		void testRoute.addTrip(new TestTrip('1', 'testTrip', false));
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
		testRoute.addTrip(new RejseplanenTrip('1', 'testTrip', false));
		expect(testRoute.trips().length).toBe(2);
		expect(testRoute.trips()[0].name()).toBe('testTrip');
	});

	it('can get an item from its collection of Trips by trip name', () => {
		expect(testRoute.trips().length).toBe(1);
		testRoute.addTrip(new RejseplanenTrip('1', 'testTrip', false));
		expect(testRoute.getTripByName('testTrip')).toBeDefined();
		expect(testRoute.getTripByName('testTrip').apiId()).toBe('1');
	});

	it('has a type', () => {
		expect(testRoute.type()).toBe(1); // get
		expect(testRoute.type(2)).toBe(2); // set
	});

	it('has an icon url', () => {
		expect(testRoute.iconUrl()).toBe('route_icon.png'); // get
		expect(testRoute.iconUrl('another-icon.png')).toBe('another-icon.png'); // set
	});

	it('has an icon alt text', () => {
		expect(testRoute.iconAltText()).toBe('Route icon'); // get
		expect(testRoute.iconAltText('Some other icon alt text')).toBe('Some other icon alt text'); // set
	});

	it('has a shared (static) list of route types', () => {
		expect(Route.types().lightrail).toBe(0);
	});

	it('has a product name', () => {
		expect(testRoute.productName()).toBe('RejseplanenRoute');
	});

	it('has an agency', () => {
		expect(testRoute.agency().name()).toBe('test agency'); // get
		expect(testRoute.agency(new RejseplanenAgency('', 'another agency')).name()).toBe('another agency'); // set
	});

	it('can parse API JSON into an object model structure', () => {
		testRoute = RejseplanenRoute.prototype.createProduct(DepartureBoard.Departure[0]);
		expect(testRoute.apiId()).not.toBeDefined();
		expect(testRoute.name()).toBe('B');
		expect(testRoute.type()).toBe(Route.types().subway);
		expect(testRoute.iconUrl()).toBe('images/api-rejseplanen-route-b.png');
		expect(testRoute.iconAltText()).toBe('Line B');

		testRoute = RejseplanenRoute.prototype.createProduct(DepartureBoard.Departure[2]);
		expect(testRoute.apiId()).not.toBeDefined();
		expect(testRoute.name()).toBe('RE 1819');
		expect(testRoute.type()).toBe(Route.types().rail);
		expect(testRoute.iconUrl()).toBe('images/api-rejseplanen-route-re.png');
		expect(testRoute.iconAltText()).toBe('Train');

		testRoute = RejseplanenRoute.prototype.createProduct(DepartureBoard.Departure[3]);
		expect(testRoute.apiId()).not.toBeDefined();
		expect(testRoute.name()).toBe('IC 68629');
		expect(testRoute.type()).toBe(Route.types().rail);
		expect(testRoute.iconUrl()).toBe('images/api-rejseplanen-route-ic.png');
		expect(testRoute.iconAltText()).toBe('InterCity');

		testRoute = RejseplanenRoute.prototype.createProduct(DepartureBoard.Departure[6]);
		expect(testRoute.apiId()).not.toBeDefined();
		expect(testRoute.name()).toBe('Re 4504');
		expect(testRoute.type()).toBe(Route.types().rail);
		expect(testRoute.iconUrl()).toBe('images/api-rejseplanen-route-re.png');
		expect(testRoute.iconAltText()).toBe('Regional train');

		testRoute = RejseplanenRoute.prototype.createProduct(DepartureBoard.Departure[20]);
		//console.log(testRoute);
		expect(testRoute.apiId()).not.toBeDefined();
		expect(testRoute.name()).toBe('Metro M2');
		expect(testRoute.type()).toBe(Route.types().subway);
		expect(testRoute.iconUrl()).toBe('images/api-rejseplanen-route-m2.png');
		expect(testRoute.iconAltText()).toBe('Metro M2');
	});

	it('can parse an API route type string into a generic Google Transit API type', () => {
		let parser: Function = RejseplanenRoute.prototype.parseRouteType;
		expect(parser('IC')).toBe(Route.types().rail);
		expect(parser('LYN')).toBe(Route.types().rail);
		expect(parser('REG')).toBe(Route.types().rail);
		expect(parser('TOG')).toBe(Route.types().rail);
		expect(parser('BUS')).toBe(Route.types().bus);
		expect(parser('EXB')).toBe(Route.types().bus);
		expect(parser('NB')).toBe(Route.types().bus);
		expect(parser('TB')).toBe(Route.types().bus);
		expect(parser('S')).toBe(Route.types().subway);
		expect(parser('M')).toBe(Route.types().subway);
		expect(parser('F')).toBe(Route.types().ferry);
	});

	it('can convert itself to JSON', () => {
		expect(testRoute.toJSON).toBeDefined();
		let json: any = testRoute.toJSON();
		expect(json._agency).toBeDefined();
		expect(json._agency._className).toBeDefined();
		expect(json._agency._modelId).toBeDefined();
		expect(json._apiId).toBe('2');
		expect(json._className).toBe('RejseplanenRoute');
		expect(json._iconUrl).toBe('route_icon.png');
		expect(json._iconAltText).toBe('Route icon');
		expect(json._name).toBe('B');
		expect(json._modelId).toBe(testRoute.modelId());
		expect(json._trips).toBeDefined();
		expect(json._trips.constructor).toBe(Array);
		expect(json._trips[0]._className).toBe('RejseplanenTrip');
		expect(json._trips[0]._modelId).toBeDefined();
	});

	afterEach(() => {
		testRoute = undefined;
	});
});