'use strict';

import {Journey} from './journey.model';
import {Leg} from './leg.model';

describe('model Journey', () => {
	let testJourney: Journey;
	
	beforeEach(() => {
		testJourney = new Journey();
		void testJourney.apiId('5');
	});

	it('has a collection of legs', () => {
		expect(testJourney.legs().constructor).toBe(Array);
	});

	it('can add a leg', () => {
		testJourney.addLeg(new Leg(undefined, undefined, '', [{text: 'notes', from: 0, to: 0}]));
		let legs = testJourney.legs();
		expect(legs.length).toBe(1);
		expect(legs[0].notes()[0].text).toBe('notes');
	});

	it('can convert itself to JSON', () => {
		testJourney.addLeg(new Leg(undefined, undefined, '', [{text: 'Leg 1', from: 0, to: 0}]));
		testJourney.addLeg(new Leg(undefined, undefined, '', [{text: 'Leg 2', from: 0, to: 0}]));
		testJourney.addLeg(new Leg(undefined, undefined, '', [{text: 'Leg 3', from: 0, to: 0}]));
		expect(testJourney.toJSON).toBeDefined();
		let json: any = testJourney.toJSON();
		expect(json._apiId).toBe(testJourney.apiId());
		expect(json._className).toBe('Journey');
		expect(json._modelId).toBe(testJourney.modelId());
		expect(json._legs.length).toBe(3);
		expect(json._legs[0]._className).toBe('Leg');
		expect(json._legs[0]._modelId).toBeDefined();
		expect(json._legs[1]._className).toBe('Leg');
		expect(json._legs[1]._modelId).toBeDefined();
		expect(json._legs[2]._className).toBe('Leg');
		expect(json._legs[2]._modelId).toBeDefined();
	});

	afterEach(() => {
		testJourney = undefined;
	});
});