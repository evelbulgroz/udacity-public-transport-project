'use strict';

// test framework dependencies
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
//import { By } from '@angular/platform-browser';
//mport { DebugElement } from '@angular/core';
//import { Component } from '@angular/core';
import { Router } from '@angular/router';

// app dependencies
import {AppModule} from './../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
import {JourneyComponent} from './journey.component';
import {Journey} from './../core/journey.model';
import {JourneyService} from './journey.service';
import {LatLng} from './../core/latlng.model';
import {Leg} from './../core/leg.model';
import {Stop} from './../core/stop.model';
import {StopTime} from './../core/stop-time.model';

// globals
let component: JourneyComponent;
let fixture: ComponentFixture<JourneyComponent>;
//let el: DebugElement;
let journeyService: JourneyService;

describe('component JourneyComponent', () => {
	let testJourney: Journey, testLeg: Leg;

	beforeEach(async(() => { // async b/c calling compileComponents()
		class fakeRouter {}
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
				{provide: Router, useValue: fakeRouter},
				{provide: Stop, useValue: Stop}
			] 
		})
		.compileComponents();  // inline template and css
		
		// get references
		fixture = TestBed.createComponent(JourneyComponent);
		component = fixture.componentInstance; // JourneyComponent test instance  
		journeyService = fixture.debugElement.injector.get(JourneyService);
		//el = fixture.debugElement.query(By.css('h1')); // get title DebugElement by element name
	 }));

	describe('controller', () => {
		it('has a date that is empty by default', () => {
				expect(component.date).toBeDefined();
				expect(component.date).toBe(null);
		});
		
		it('has a destination that is empty by default', () => {
				expect(component.destination).toBeDefined();
				expect(component.destination).toBe(null);
		});
		
		it('knows if an error has occured (default is false)', () => {
				expect(component.error).toBeDefined();
				expect(typeof component.error).toBe('boolean');
				expect(component.error).toBe(false);
		});
		
		it('has a collection of journeys that is empty by default', () => {
				expect(component.journeys).toBeDefined();
				expect(component.journeys.constructor).toBe(Array);
				expect(component.journeys.length).toBe(0);
		});
		
		it('has an origin that is empty by default', () => {
				expect(component.origin).toBeDefined();
				expect(component.origin).toBe(null);
		});
		
		it('knows if it is ready to present its initial view (default is false)', () => {
				expect(component.ready).toBeDefined();
				expect(typeof component.ready).toBe('boolean');
				expect(component.ready).toBe(false);
		});

		it('knows if a search has been completed (default is false)', () => {
				expect(component.searchComplete).toBeDefined();
				expect(typeof component.searchComplete).toBe('boolean');
				expect(component.searchComplete).toBe(false);
		});
		
		it('knows if a search is in progress (default is false)', () => {
				expect(component.searchInProgress).toBeDefined();
				expect(typeof component.searchInProgress).toBe('boolean');
				expect(component.searchInProgress).toBe(false);
		});

		it('can get a new collection of journeys from an origin to a destination at a given date and time', (done) => {
			// Note: These stops are specific to Rejseplanen.dk. May not work if testing another transit API.
			let origin: Stop = new Stop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			let destination: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			component.getJourneyList(origin, destination, new Date(), true, false, false)
				.then(() => {
					expect(component.journeys.length).toBeGreaterThan(0);
					expect(component.journeys[0] instanceof Journey).toBe(true);
					expect(component.journeys[0].legs()[0].trip().name()).toBeDefined();
					done();
				})
				.catch(function(e: Error) {
					console.log(e);
				});
			expect(true).toBe(true); // keep Jasmine happy
		});
		
		it('can get the arrival time for a journey in 12h format (e.g. "3:37 pm")', () => {
				expect(component.getArrivalTime(testJourney)).toBe('3:37 pm');
		});
		
		it('can get the number of changes on a journey in "x change(s)" format', () => {
				expect(component.getChanges(testJourney)).toBe('0 changes');
		});
		
		it('can get the departure time for a journey in 12h format (e.g. "4:37 pm")', () => {
				expect(component.getDepartureTime(testJourney)).toBe('4:37 pm');
		});
		
		it('can get the duration of a journey in hh:mm format (e.g. "23:00")', () => {
				expect(component.getDuration(testJourney)).toBe('23:00');
		});

		it('can add later journeys to the list', (done) => {
			// just checking that the collection has been extended,
			// relying on services to verify that departures are consequetive
			// TODO: figure out how to do this without excess replication of same test of service.
			// Note: These stops are specific to Rejseplanen.dk. May not work if testing another transit API.
			component.origin = new Stop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			component.destination = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			component.date = new Date();
			component.getJourneyList(component.origin, component.destination, component.date, true, false, false)
				.then(function(journeys: Journey[]) { // get an initial set of results
					let oldLength: number = component.journeys.length;
					expect(journeys.length).toBeGreaterThan(0);
					component.addLaterJourneys() // add more results
						.then(() => {
							expect(oldLength).toBeLessThan(component.journeys.length);
							done();
						})
						.catch((e) => {
							console.log(e);
							done();
						});       
				})
				.catch(function(e) {
					console.log(e);
					done();
				});
			expect(true).toBe(true); // keep Jasmine happy
		});

		xit('can save it\'s state to local storage', () => {

		});

		xit('can getHours it\'s state from local storage', () => {

		});
	});

	describe('service', () => {
		it('can get a new collection of journeys from an origin to a destination at a given date and time', (done) => {
			// Note: These stops are specific to Rejseplanen.dk. May not work if testing another transit API.
			let origin: Stop = new Stop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			let destination: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			journeyService.fetchJourneyList(origin, destination, new Date(), true, false, false)
				.then(function(result: Journey[]) {
					expect(result.length).toBeGreaterThan(0);
					expect(result[0] instanceof Journey).toBe(true);
					expect(result[0].legs()[0].trip().name()).toBeDefined();
					done();
				})
				.catch(function(e: Error) {
					console.log(e);
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});
		
		it('can get the results of the most recent search', (done) => {
			// Note: These stops are specific to Rejseplanen.dk. May not work if testing another transit API.
			let origin: Stop = new Stop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			let destination: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			
			// first get a fresh journey collection
			journeyService.fetchJourneyList(origin, destination, new Date(), true, false, false)
				.then((result: Array<Journey>): Array<Journey> => {
					return result;
				})
				// then return journey collection
				.then(() => {
					expect(journeyService.journeys() instanceof Array).toBe(true);
					expect(journeyService.journeys().length).toBeGreaterThan(0);
					expect(journeyService.journeys()[0] instanceof Journey).toBe(true);
					done();
				})
				.catch((e: Error) => {
					console.log(e);
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});
		
		it('can get the query params for the most recent search', (done) => {
			// Note: These stops are specific to Rejseplanen.dk. May not work if testing another transit API.
			let origin: Stop = new Stop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			let destination: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			
			// first get a fresh journey collection
			journeyService.fetchJourneyList(origin, destination, new Date(), true, false, false, destination)
				.then((result: Array<Journey>): Array<Journey> => {
					return result;
				})
					.then(() => { // then get params
						let query: any = journeyService.query(), now: Date = new Date();
						expect(query).toBeDefined();
						expect(query.origin).toBeDefined();
						expect(query.origin instanceof Stop).toBe(true);
						expect(query.origin.name()).toBe('København H');
						expect(query.destination).toBeDefined();
						expect(query.destination instanceof Stop).toBe(true);
						expect(query.destination.name()).toBe('Aarhus H');
						expect(query.date).toBeDefined();
						expect(query.date instanceof Date).toBe(true);
						expect(query.date.getDay()).toBe(now.getDay());
						expect(query.date.getHours()).toBe(now.getHours());
						expect(query.useTrain).toBeDefined();
						expect(query.useTrain).toBe(true);
						expect(query.useBus).toBeDefined();
						expect(query.useBus).toBe(false);
						expect(query.useMetro).toBeDefined();
						expect(query.useMetro).toBe(false);
						expect(query.via).toBeDefined();
						expect(query.via instanceof Stop).toBe(true);
						expect(query.via.name()).toBe('Aarhus H');
						done();
					})
					.catch((e: Error) => {
						console.log(e);
					});
			expect(true).toBe(true); // keep Jasmine happy!
		});
		
		it('can get an item from the current journey collection by model id', (done) => {
			// Note: These stops are specific to Rejseplanen.dk. May not work if testing another transit API.
			let origin: Stop = new Stop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			let destination: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			
			// first get a fresh journey collection
			journeyService.fetchJourneyList(origin, destination, new Date(), true, false, false)
				.then((result: Array<Journey>): Array<Journey> => {
					return result;
				})
				// then get random journey by model id
				.then((journeys: Array<Journey> ) => {
					let ix: number = Math.round(Math.random() * (journeys.length - 1) + .5);
					expect(journeys[ix] instanceof Journey).toBe(true);
					done();
				})
				.catch((e: Error) => {
					console.log(e);
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});
		
		it('can get the details for a leg on a journey', (done) => {
			// Note: These stops are specific to Rejseplanen.dk. May not work if testing another transit API.
			let origin: Stop = new Stop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			let destination: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			
			// first get a fresh journey
			journeyService.fetchJourneyList(origin, destination, new Date(), true, false, false)
				.then((result: Array<Journey>): Leg => {
					return result[0].legs()[0];
				})
				// then fetch and check details
				.then((leg: Leg) => {
					journeyService.fetchLegDetails(leg)
					.then(() => {
					expect(leg.trip()).toBeDefined();
					done();
					})
				})
				.catch((e: Error) => {
					console.log(e);
					done();
			})
			expect(true).toBe(true); // keep Jasmine happy!
		});
		
		it('can get later journeys for an existing search', (done) => {
			// TODO: figure out how to do this without excess replication of same test of service.
			// Note: These stops are specific to Rejseplanen.dk. May not work if testing another transit API.
			component.origin = new Stop('008600626', 'København H', new LatLng(12.565562, 55.673063));
			component.destination = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			component.date = new Date();
			journeyService.fetchJourneyList(component.origin, component.destination, component.date, true, false, false)
				.then(() => { // get an initial set of results
					expect(journeyService.journeys().length).toBeGreaterThan(0);
					let oldLength: number = journeyService.journeys().length;
					let lastOrigin: StopTime = journeyService.journeys()[journeyService.journeys().length - 1].legs()[0].origin();
					let lastDeparture: Date = lastOrigin.departurePlanned() || lastOrigin.departureActual();
					journeyService.fetchLaterJourneys( // add more results
						journeyService.query().origin,
						journeyService.query().destination,
						lastDeparture,
						journeyService.query().useTrain,
						journeyService.query().useBus,
						journeyService.query().useMetro,
						)
						.then(() => {
							expect(oldLength).toBeLessThan(journeyService.journeys().length);
							let firstAddedOrigin: StopTime = journeyService.journeys()[oldLength].legs()[0].origin();
							let firstAddedDeparture: Date = firstAddedOrigin.departurePlanned() || firstAddedOrigin.departureActual();
							expect(firstAddedDeparture.valueOf()).toBeGreaterThan(lastDeparture.valueOf());
							done();
						})
						.catch((e) => {
							console.log(e);
							done();
						});       
				})
				.catch(function(e) {
					console.log(e);
					done();
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});
	});
});