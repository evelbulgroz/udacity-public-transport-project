'use strict';

// test framework dependencies
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// app dependencies
import {AppModule} from './../../../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
import {JourneyComponent} from './../../../journeyplanner/journey.component';
import {LatLng} from './../../../core/latlng.model';
//import {Leg} from './../../../core/leg.model';
import {RejseplanenJourney} from './../core/rejseplanen-journey.model';
import {RejseplanenJourneyService} from './rejseplanen-journey.service';
import {RejseplanenLeg} from './../core/rejseplanen-leg.model';
import {RejseplanenStop} from './../core/rejseplanen-stop.model';
import {StopTime} from './../../../core/stop-time.model';

// globals
let fixture: ComponentFixture<JourneyComponent>;
let journeyService: RejseplanenJourneyService;

describe('service RejseplanenJourneyService', () => {
	beforeEach(async(() => { // async b/c calling compileComponents()
		// create mocks
		class fakeRouter {}
		
		// initialize test bed (pretty slow, optimize later)
		TestBed.configureTestingModule({
		//declarations: [ArrivalsComponent], // unnescessary when also importing AppModule
			imports: [
				AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
									// along with the module's components
			],
			providers: [ // provide injected dependencies, fake (preferred) or real
				RejseplanenJourneyService,
				{provide: Router, useValue: fakeRouter},
				{provide: RejseplanenStop, useValue: RejseplanenStop}
			] 
		})
		.compileComponents(); // inline template and css

		// get references (only using service here)
		fixture = TestBed.createComponent(JourneyComponent);
		journeyService = fixture.debugElement.injector.get(RejseplanenJourneyService);
	}));

	it('can get a list of journeys from an origin to a destination at a given date and time', (done) => {
			let origin: RejseplanenStop = new RejseplanenStop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			let destination: RejseplanenStop = new RejseplanenStop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));

			function _validateJourney(journey: any) {
				expect(journey instanceof RejseplanenJourney).toBe(true);
				expect(journey.legs().length).toBeGreaterThan(0);
				journey.legs().forEach((leg: any) => {
					// leg
						expect(leg instanceof RejseplanenLeg).toBe(true);
						expect(typeof leg.detailsUrl()).toBe('string');
						expect(leg.notes() instanceof Array).toBe(true);
					// origin
						let origin: any = leg.origin();
						expect(origin instanceof StopTime).toBe(true);
						expect(origin.departurePlanned().constructor).toBe(Date);
						let stop: any = origin.stop();
						expect(stop instanceof RejseplanenStop).toBe(true);
						expect(typeof stop.apiId()).toBe('string');
						expect(typeof stop.isStation()).toBe('boolean');
						expect(typeof stop.name()).toBe('string');
					// destination
						let destination: any = leg.destination();
						expect(destination instanceof StopTime).toBe(true);
						expect(destination.arrivalPlanned().constructor).toBe(Date);
						stop = destination.stop();
						expect(stop instanceof RejseplanenStop).toBe(true);
						expect(typeof stop.apiId()).toBe('string');
						expect(typeof stop.isStation()).toBe('boolean');
						expect(typeof stop.name()).toBe('string');
				});
			}

			journeyService.fetchJourneyList(origin, destination, new Date(), true, false, false)
				.then((result: Array<RejseplanenJourney>) => {
						expect(result.length).toBeGreaterThan(0);
						result.forEach((journey: any) => {
							_validateJourney(journey);
						});
						done();
				})
				.catch((e: Error) => {
					console.log(e);
					throw e; // bubble up to caller
				})
			expect(true).toBe(true); // keep Jasmine happy!
		});
	
	it('can get the details for a leg on a journey', (done) => {
		let origin: RejseplanenStop = new RejseplanenStop('008600626', 'København H', new LatLng(12.565562, 55.673063));
		let destination: RejseplanenStop = new RejseplanenStop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			
		// first get a fresh journey
		journeyService.fetchJourneyList(origin, destination, new Date(), true, false, false)
			.then((result: Array<RejseplanenJourney>) => {
				return result[0].legs()[0];
			})
			 // then fetch and check details
			.then((leg: RejseplanenLeg) => {
				journeyService.fetchLegDetails(leg)
				.then(() => {
					expect(leg.trip()).toBeDefined();
					expect(leg.trip().stopTimes()).toBeDefined();
					expect(leg.trip().stopTimes().length).toBeGreaterThan(0);
					leg.messages().forEach((message: any) => {
						expect(typeof message).toBe('object'); 
						/*
						let keys: Array<string> = Object.keys(message);
						expect(keys[0]).toBe('header');
						expect(keys[1]).toBe('text');
						expect(keys[2]).toBe('links');
						*/
					});
				 	leg.notes().forEach((note: any) => {
						let keys: Array<string> = Object.keys(note);
						expect(keys[0]).toBe('text');
						expect(keys[1]).toBe('from');
						expect(keys[2]).toBe('to');
					});
					done();
				})
			})
			.catch((e: Error) => {
				console.log(e);
				throw e; // bubble up to caller
			})
		expect(true).toBe(true); // keep Jasmine happy!
	});

	it('can get later journeys for a given search', (done) => {
		let origin: RejseplanenStop = new RejseplanenStop('008600626', 'København H', new LatLng(12.565562, 55.673063));
		let destination: RejseplanenStop = new RejseplanenStop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
		// first get a fresh journey collection
		journeyService.fetchJourneyList(origin, destination, new Date(), true, false, false)
			.then((result: Array<RejseplanenJourney>) => {
					return result;
			})
			.then((journeys: Array<RejseplanenJourney>) => { // then get later journeys and test that they are indeed later
				 let lastLeg: any = journeys[journeys.length - 1].legs()[0];
				 let lastDeparture: Date = lastLeg.origin().departureActual() || lastLeg.origin().departurePlanned();
				 journeyService.fetchLaterJourneys(origin, destination, lastDeparture, true, false, false)
						.then((result: Array<RejseplanenJourney>) => {
							let firstLeg: any = result[0].legs()[0];
							let firstDeparture: Date = firstLeg.origin().departureActual() || firstLeg.origin().departurePlanned();
							expect(firstDeparture.valueOf()).toBeGreaterThan(lastDeparture.valueOf());
							done();
					 })
			})
			.catch((e: Error) => {
				console.log(e);
				throw e; // bubble up to caller
			})
		expect(true).toBe(true); // keep Jasmine happy!
	});
});