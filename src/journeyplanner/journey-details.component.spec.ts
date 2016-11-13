'use strict';

// test framework dependencies
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
//import { By } from '@angular/platform-browser';
//mport { DebugElement } from '@angular/core';
//import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// app dependencies
import {AppModule} from './../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
import {JourneyDetailsComponent} from './journey-details.component';
import {Journey} from './../core/journey.model';
import {JourneyService} from './journey.service';
//import {LatLng} from './../core/latlng.model';
import {Leg} from './../core/leg.model';
import {StopTime} from './../core/stop-time.model';


// globals
let comp: JourneyDetailsComponent;
let fixture: ComponentFixture<JourneyDetailsComponent>;
//let el: DebugElement;
let journeyService: JourneyService;

describe('component JourneyDetailsComponent', () => {
	let testJourney: Journey, testLeg: Leg;

	beforeEach(async(() => { // async b/c calling compileComponents()
		class fakeRoute extends ActivatedRoute {}
		let now = new Date('Mon Oct 10 2016 16:37:18 GMT+0200 (Romance Daylight Time)');
		testLeg = new Leg(
			new StopTime(undefined, undefined, now, now),
			new StopTime(undefined, undefined, undefined, undefined, undefined, undefined, new Date(now.valueOf() + 23*60*60*1000), new Date(now.valueOf() + 23*60*60*1000))
		);
		testJourney = new Journey(undefined);
		void testJourney.addLeg(testLeg);

		// initialize test bed (pretty slow, optimize later)
		TestBed.configureTestingModule({
		//declarations: [ArrivalsComponent], // unnescessary when also importing AppModule
			imports: [
			AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
						// along with the module's components
			],
			providers: [ // provide injected dependencies, fake (preferred) or real
				// JourneyService provided by AppModule
				{provide: ActivatedRoute, useValue: fakeRoute}
			] 
		})
		.compileComponents();  // inline template and css
		
		// get references
		fixture = TestBed.createComponent(JourneyDetailsComponent);
		comp = fixture.componentInstance; // JourneyComponent test instance 
		journeyService = fixture.debugElement.injector.get(JourneyService);
		//el = fixture.debugElement.query(By.css('h1')); // get title DebugElement by element name
	}));

	describe('controller', () => {
		it('has a destination that is empty by default', () => {
			expect(comp.destination).toBeDefined();
			expect(comp.destination).toBe(null);
	    });

		it('has a journey that is empty by default', () => {
			expect(comp.journey).toBeDefined();
			expect(comp.journey).toBe(null);
	    });

		it('has an origin that is empty by default', () => {
			expect(comp.origin).toBeDefined();
			expect(comp.origin).toBe(null);
	    });

		it('can get the departure date and time for a journey in "ddd, MMM D, YYYY h:mm a" format (e.g.  "Tue, Oct 11, 2016 4:07 pm")', () => {
			expect(comp.getDate(testJourney)).toBe('Mon, Oct 10, 2016 4:37 pm');
	    });

		it('can get the departure time for a leg in 12h format (e.g. "4:37 pm")', () => {
			expect(comp.getDepartureTime(testLeg)).toBe('4:37 pm');
	    });

		it('can get the duration of a leg in hh:mm format (e.g. "23:00")', () => {
			expect(comp.getDuration(testLeg)).toBe('23:00');
	    });

		xit('can save it\'s state to local storage', () => {

		});

		xit('can getHours it\'s state from local storage', () => {

		});
	})
});