'use strict';

//import {Leg} from'./../../../core/leg.model';
import {RejseplanenJourney} from './rejseplanen-journey.model';
import {RejseplanenLeg} from './rejseplanen-leg.model';
import {TripList} from './../journeyplanner/rejseplanen-journey.mock';

describe('model RejseplanenJourney', () => {
	let testJourney: RejseplanenJourney;
	
	beforeEach(() => {
		testJourney = new RejseplanenJourney();
	});

	it('has a collection of legs', () => {
		expect(testJourney.legs().constructor).toBe(Array);
	});

	it('can add a leg', () => {
		testJourney.addLeg(new RejseplanenLeg(undefined, undefined, '', [{text: 'Leg 1', from: 0, to: 0}]));
		let legs = testJourney.legs();
		expect(legs.length).toBe(1);
		expect(legs[0].notes()[0].text).toBe('Leg 1');
	});

	it('has a product name', () => {
		expect(testJourney.productName()).toBe('RejseplanenJourney');
	});

	it('can parse API JSON into an object model structure', () => {
		testJourney = RejseplanenJourney.prototype.createProduct(TripList.Trip[0]);
		expect(testJourney.legs().length).toBe(2);
		expect(testJourney.legs()[0].destination().stop().name()).toBe('Fredericia St.');
	});

	it('can convert itself to JSON', () => {
		testJourney.addLeg(new RejseplanenLeg(undefined, undefined, '', [{text: 'Leg 1', from: 0, to: 0}]));
		testJourney.addLeg(new RejseplanenLeg(undefined, undefined, '', [{text: 'Leg 2', from: 0, to: 0}]));
		testJourney.addLeg(new RejseplanenLeg(undefined, undefined, '', [{text: 'Leg 3', from: 0, to: 0}]));
		expect(testJourney.toJSON).toBeDefined();
		let json: any = testJourney.toJSON();
		expect(json._apiId).toBe(testJourney.apiId());
		expect(json._className).toBe('RejseplanenJourney');
		expect(json._modelId).toBe(testJourney.modelId());
		expect(json._legs.length).toBe(3);
		expect(json._legs[0]._className).toBe('RejseplanenLeg');
		expect(json._legs[0]._modelId).toBeDefined();
		expect(json._legs[1]._className).toBe('RejseplanenLeg');
		expect(json._legs[1]._modelId).toBeDefined();
		expect(json._legs[2]._className).toBe('RejseplanenLeg');
		expect(json._legs[2]._modelId).toBeDefined();
	});

	afterEach(() => {
		testJourney = undefined;
	});
});