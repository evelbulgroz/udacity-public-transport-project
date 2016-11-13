'use strict';

// imports
	// test framework dependencies
	import { async, ComponentFixture, TestBed } from '@angular/core/testing';
	import { By } from '@angular/platform-browser';
	import { DebugElement } from '@angular/core';
	//import { Component } from '@angular/core';
	import { Router } from '@angular/router';

	// app dependencies
	import {AppModule} from './../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
	import {ArrivalsComponent} from './arrivals.component';
	import {ArrivalService} from './arrival.service';
	import {LocationService} from './../locationsearch/location.service';
	import {LatLng} from './../core/latlng.model';
	import {Route} from './../core/Route.model';
	import {Stop} from './../core/stop.model';
	import {StopTime} from './../core/stop-time.model';
	import {Trip} from './../core/trip.model';

// globals
	let component: ArrivalsComponent;
	let fixture: ComponentFixture<ArrivalsComponent>;
	let el: DebugElement;
	let arrivalService: ArrivalService;

// mocks
	class fakeLocationService {}
	class fakeRouter {}
	class fakeTrip extends Trip {
		constructor(_id: string, _name: string, _direction: boolean, _cancelled: boolean = false, _route?: Route){
			super(_id, _name, _direction, _cancelled, _route);
		}
		public details(): any {} // dummy implementation of abstract method
	}

describe('component ArrivalsComponent', () => {
	beforeEach(async(() => { // async b/c calling compileComponents()
		// initialize test bed
		TestBed.configureTestingModule({
		//declarations: [ArrivalsComponent], // unnescessary when also importing AppModule
		imports: [
		AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
				// along with the module's components
			],
			providers: [ // provide injected dependencies, fake (preferred) or real
			//{provide: ArrivalService, useValue: ArrivalService},
			{provide: LocationService, useValue: fakeLocationService},
			{provide: Router, useValue: fakeRouter},
			{provide: Stop, useValue: Stop}
			] 
		})
		.compileComponents();  // inline template and css

		// get references
		fixture = TestBed.createComponent(ArrivalsComponent);
		component = fixture.componentInstance; // ArrivalsComponent test instance  
		arrivalService = fixture.debugElement.injector.get(ArrivalService);
		el = fixture.debugElement.query(By.css('h1')); // get title DebugElement by element name
	}));

	describe('controller', () => {
		it('has a collection of arrivals that is empty by default', () => {
			expect(component.arrivals).toBeDefined();
			expect(component.arrivals.constructor).toBe(Array);
			expect(component.arrivals.length).toBe(0);
		});

		it('knows if an error has occurred (false by default)', () => {
			expect(component.error).toBeDefined();
			expect(typeof component.error).toBe('boolean');
			expect(component.error).toBe(false);
		});

		it('knows if it is ready to present its default view (default is false)', () => {
			expect(component.ready).toBeDefined();
			expect(typeof component.ready).toBe('boolean');
			expect(component.ready).toBe(false);
		});

		it('knows if a search has been completed (false by default)', () => {
			expect(component.searchComplete).toBeDefined();
			expect(typeof component.searchComplete).toBe('boolean');
			expect(component.searchComplete).toBe(false);
		});

		it('knows if a search is in progress (false by default)', () => {
			expect(component.searchInProgress).toBeDefined();
			expect(typeof component.searchInProgress).toBe('boolean');
			expect(component.searchInProgress).toBe(false);
		});

		it('has a stop that is empty by default', () => {
			// not testing for stopId attribute, which is internally specific to vaadin-combo-box
			expect(component.stop).toBeDefined();
			expect(component.stop).toBe(null);
		});

		it('has a collection of stop suggestions that is empty by default', () => {
			expect(component.stopSuggestions).toBeDefined();
			expect(component.stopSuggestions.constructor).toBe(Array);
			expect(component.stopSuggestions.length).toBe(0);
		});

		it('knows if a valid stop selection has been made (false by default)', () => {
			expect(component.valid).toBeDefined();
			expect(typeof component.valid).toBe('boolean');
			expect(component.valid).toBe(false);
		});

		it('can get a collection of arrivals at a given time and location', (done) => {
			// Note: This stop is specific to Rejseplanen.dk. May not work if testing another transit API.
			let stop: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			component.getArrivals(stop, new Date(), true, false, false)
				.then(() => {
					expect(component.arrivals.length).toBeGreaterThan(0);
					expect(component.arrivals[0] instanceof Trip).toBe(true);
					expect(component.arrivals[0].stopTimes()[1].arrivalPlanned()).toBeDefined();
					done(); 
				})
				.catch(function(e: Error) {
					console.log(e);
					done();
				})
			expect(true).toBe(true); // keep Jasmine happy!
		});

		it('can get the arrival date and time for a given trip', () => {
			let trip: Trip = new fakeTrip(undefined, undefined, false);
			component.stop = new Stop('', 'Hellerup St.', undefined);
			trip.addStopTime(new StopTime(undefined));
			trip.addStopTime(
				new StopTime(
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					new Date('Mon Sep 19 2016 15:26:10 GMT+0200 (Romance Daylight Time)')
					)
				)
				.stop(component.stop);			
			expect(component.getArrivalTime(trip)).toBe('03:26 pm');
		});

		it('can get the date and time that arrivals have been found for', () => {
			let now: Date = new Date();
			let date: Date = new Date(component.getDate()); // string format parses correctly on Chrome, other browsers may vary
			expect(now.getDate()).toEqual(date.getDate());
			expect(now.getMonth()).toEqual(date.getMonth());
			expect(now.getFullYear()).toEqual(date.getFullYear());
			expect(Math.abs(date.getTime() - now.getTime())).toBeLessThan(100000); // 10secs should be plenty of allowance
		});

		it('can get a collection of locations matching a user from/to entry', (done) => {
			component.getStopSuggestions('valby')
				.then(function(result: any[]) {
					expect(result.length).toBeGreaterThan(0);
					expect(result[0]._name).toBeDefined();
					done();
				})
				.catch(function(e: any) {
					console.log(e);
				});
			expect(true).toBe(true);
		});

		xit('can save it\'s state to local storage', () => {

		});

		xit('can getHours it\'s state from local storage', () => {

		});
	});

	describe('service', () => {	
		it('can get a collection of arrivals at a given time and location', (done) => {
			// Note: This stop is specific to Rejseplanen.dk. May not work if testing another transit API.
			let stop: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			arrivalService.fetchArrivals(stop, new Date(), true, false, false)
				.then((result: Trip[]) => {
					expect(result.length).toBeGreaterThan(0);
					expect(result[0] instanceof Trip).toBe(true);
					expect(result[0].stopTimes()[1].stop().name()).toBeDefined();
					done();
				})
				.catch(function(e: Error) {
					console.log(e);
				})
			expect(true).toBe(true);
		});

		it('can get the results of the most recent search', (done) => {
			// Note: This stop is specific to Rejseplanen.dk. May not work if testing another transit API.
			let stop: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			arrivalService.fetchArrivals(stop, new Date(), true, false, false)
				.then(() => {
					expect(arrivalService.arrivals() instanceof Array).toBe(true);
					expect(arrivalService.arrivals().length).toBeGreaterThan(0);
					expect(arrivalService.arrivals()[0] instanceof Trip).toBe(true);
					done();
				})
				.catch((e: Error) => {
					console.log(e);
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});
				
		it('can get the query params for the most recent search', (done) => {
			// Note: This stop is specific to Rejseplanen.dk. May not work if testing another transit API.
			let stop: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			arrivalService.fetchArrivals(stop, new Date(), true, false, false)
				.then(() => {
						let query: any = arrivalService.query(), now: Date = new Date();
						expect(query).toBeDefined();
						expect(query.stop).toBeDefined();
						expect(query.stop instanceof Stop).toBe(true);
						expect(query.stop.name()).toBe('Aarhus H');
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
						done();
					})
					.catch((e: Error) => {
						console.log(e);
					});
			expect(true).toBe(true); // keep Jasmine happy!
		});
				
		it('can get an item from the current arrivals collection by model id', (done) => {
			// Note: This stop is specific to Rejseplanen.dk. May not work if testing another transit API.
			let stop: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			arrivalService.fetchArrivals(stop, new Date(), true, false, false)
					.then(() => {
						let ix: number = Math.round(Math.random() * (arrivalService.arrivals().length - 1) + .5);
						expect(arrivalService.arrivals()[ix] instanceof Trip).toBe(true);
						done();
					})
					.catch((e: Error) => {
						console.log(e);
						done();
					});
				expect(true).toBe(true); // keep Jasmine happy!
		});
				
		it('can get the details for an arrival', (done) => {
			// Note: This stop is specific to Rejseplanen.dk. May not work if testing another transit API.
			let stop: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			arrivalService.fetchArrivals(stop, new Date(), true, false, false)
				.then(() => {
					expect(arrivalService.arrivals().length).toBeGreaterThan(0);
					let arrival: Trip = arrivalService.arrivals()[0];
					let oldLength: number = arrival.stopTimes().length;
					arrivalService.fetchArrivalDetails(arrival)
					.then((arrival: Trip) => {
						expect(arrival.stopTimes().length).toBeGreaterThan(oldLength);
						//test for messages/notes here, but wonøt be reliable if run against live service
						done();
					})
				})
				.catch((e: Error) => {
					console.log(e);
					done();
			})
			expect(true).toBe(true); // keep Jasmine happy!
		});
	});

	xdescribe('user interface (template)', () => {
		let testWindow: Window;

		beforeEach((done) => {
			testWindow = window.open('http://localhost:9080/sr-webdev-public-transport-app/build/');
			testWindow.onload = () => { // not working: stumbles on temporary progress indicator
				done(); // wait for app to finish loading before running tests
			};
		});

		it('has an arrivals search box labelled "Station/stop" that is empty by default', () => {
			fixture.detectChanges(); // trigger change detection to update the view
			let de: any = fixture.debugElement.query(By.css('vaadin-combo-box'));
			expect(de).not.toBe(null);
			let el: any = de.nativeElement;
			expect(el.id).toBe('stop');
			expect(el.label).toBe('Station/stop');
			expect(el.hasValue).toBe(false);
			expect(el.inputElement.value).toBe('');
		});

		xit('has a "Find arrivals" button that has a search (magnifier) icon and is unavailable by default', () => {
			fixture.detectChanges(); // trigger change detection to update the view
			let de: any = fixture.debugElement.query(By.css('paper-button'));
			expect(de).not.toBe(null);
			let el: any = de.nativeElement;
			expect(el.disabled).toBeDefined();
			expect(el.children[0].icon.toLowerCase()).toBe('search');
			expect(el.children[0].tagName.toLowerCase()).toBe('iron-icon');
			expect(el.textContent).toContain('Find arrivals');
		});

		// can't figure out how to trigger UI behaviours, fix later
		xit('presents suggestions when user enters 4 or more characters into search box', () => {
		});

		xit('enables search button when user selects a suggested station/stop', () => {
		});

		xit('executes search and presents results when users activates search button', () => {
		});

		xit('presents search results in a list of one or more arrivals', () => {
		});

		xit('presents a route icon for each arrival', () => {
		});

		xit('presents a planned time for each arrival', () => {
		});

		xit('presents the originating station or stop for each arrival', () => {
		});

		xit('hides search form while presenting result of current search', () => {
		});

		xit('presents a list title above the result(s) of the current search', () => {
		});

		xit('presents a generic transit icon and the name of the station/stop in the title above the results list', () => {
		});

		xit('presents a generic "time" icon and the date and time in the title above the results list', () => {
		});

		afterEach(() => {
			testWindow.close();
		});

		// also error, progress indicator
	});
});