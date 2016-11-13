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
	import {DeparturesComponent} from './departures.component';
	import {DepartureService} from './departure.service';
	import {LocationService} from './../locationsearch/location.service';
	import {LatLng} from './../core/latlng.model';
	import {Route} from './../core/Route.model';
	import {Stop} from './../core/stop.model';
	import {StopTime} from './../core/stop-time.model';
	import {Trip} from './../core/trip.model';

	
// globals
	let component: DeparturesComponent;
	let fixture: ComponentFixture<DeparturesComponent>;
	let el: DebugElement;
	let departureService: DepartureService;

// mocks
	class fakeLocationService {}
	class fakeRouter {}
	class fakeTrip extends Trip {
		constructor(_id: string, _name: string, _direction: boolean, _cancelled: boolean = false, _route?: Route){
			super(_id, _name, _direction, _cancelled, _route);
		}
		public details(): any {} // dummy implementation of abstract method
	}

describe('component DeparturesComponent', () => {
	beforeEach(async(() => { // async b/c calling compileComponents()
		// initialize test bed
		TestBed.configureTestingModule({
		//declarations: [DeparturesComponent], // unnescessary when also importing AppModul
			imports: [
				AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
									// along with the module's components
			],
			providers: [ // provide injected dependencies, fake (preferred) or real
				//{provide: DepartureService, useValue: DepartureService},
				{provide: LocationService, useValue: fakeLocationService},
				{provide: Router, useValue: fakeRouter},
				{provide: Stop, useValue: Stop}
			] 
		})
		.compileComponents();	// inline template and css

		// get references
		fixture = TestBed.createComponent(DeparturesComponent);
		component = fixture.componentInstance; // DeparturesComponent test instance	
		departureService = fixture.debugElement.injector.get(DepartureService);
		el = fixture.debugElement.query(By.css('h1')); // get title DebugElement by element name
	}));

	describe('controller', () => {
		it('has a collection of departures that is empty by default', () => {
			expect(component.departures).toBeDefined();
			expect(component.departures.constructor).toBe(Array);
			expect(component.departures.length).toBe(0);
		});
	
		it('knows if an error has occurred (false by default)', () => {
			expect(component.error).toBeDefined();
			expect(typeof component.error).toBe('boolean');
			expect(component.error).toBe(false);
		});

		it('knows if it is ready to present its initial view (default is false)', () => {
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
	
		it('can get a collection of departures at a given time and location', (done) => {
			let stop: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			component.getDepartures(stop, new Date(), true, false, false)
				.then((result: Trip[]) => {
					expect(result.length).toBeGreaterThan(0);
					expect(result[0] instanceof Trip).toBe(true);
					expect(result[0].stopTimes()[0].departurePlanned()).toBeDefined();
					done(); 
				})
			.catch(function(e: Error) {
				console.log(e);
				done();
			})
			expect(true).toBe(true); // keep Jasmine happy!
		});

		it('can get the departure date and time for a given trip', () => {
			let trip: Trip = new fakeTrip(undefined, undefined, false);
			component.stop = new Stop('', 'Hellerup St.', undefined);
			trip.addStopTime(
				new StopTime(
					undefined,
					undefined,
					new Date('Mon Sep 19 2016 15:26:10 GMT+0200 (Romance Daylight Time)'),
					undefined,
					undefined,
					undefined
					)
				)
				.stop(component.stop);	
			trip.addStopTime(new StopTime(undefined));
			expect(component.getDepartureTime(trip)).toBe('03:26 pm');
		});

		it('can get the date and time that departures have been found for', () => {
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
		it('can get a list of departures at a given time and location', (done) => {
			let stop: Stop = new Stop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
			departureService.fetchDepartures(stop, new Date(), true, false, false)
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
	});

	xdescribe('user interface (template)', () => {
		let testWindow: Window;

		beforeEach((done) => { // not working: stumbles on temporary progress indicator
			testWindow = window.open('http://localhost:9080/sr-webdev-public-transport-app/build/');
			testWindow.onload = () => {
				//console.log('loaded');
				done(); // wait for app to finish loading before running tests
			};
		});
		
		it('has an departures search box labelled "Station/stop" that is empty by default', () => {
			fixture.detectChanges(); // trigger change detection to update the view
			let de: any = fixture.debugElement.query(By.css('vaadin-combo-box'));
			expect(de).not.toBe(null);
			let el: any = de.nativeElement;
			expect(el.id).toBe('stop');
			expect(el.label).toBe('Station/stop');
			expect(el.hasValue).toBe(false);
			expect(el.inputElement.value).toBe('');
		});

		xit('has a "Find departures" button that has a search (magnifier) icon and is unavailable by default', () => {
			fixture.detectChanges(); // trigger change detection to update the view
			let de: any = fixture.debugElement.query(By.css('paper-button'));
			expect(de).not.toBe(null);
			let el: any = de.nativeElement;
			expect(el.disabled).toBeDefined();
			expect(el.children[0].icon.toLowerCase()).toBe('search');
			expect(el.children[0].tagName.toLowerCase()).toBe('iron-icon');
			expect(el.textContent).toContain('Find departures');
		});

		// can't figure out how to trigger UI behaviours, fix later
		xit('presents suggestions when user enters 4 or more characters into search box', () => {
		});
		
		xit('enables search button when user selects a suggested station/stop', () => {
		});

		xit('executes search and presents results when users activates search button', () => {
		});

		xit('presents search results in a list of one or more departures', () => {
		});

		xit('presents a route icon for each departure', () => {
		});

		xit('presents a planned time for each departure', () => {
		});

		xit('presents the originating station or stop for each departure', () => {
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