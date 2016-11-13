'use strict';

/*KNOWN ISSUE:
* Not sure how to instantiate the service on its own, so piggybagging on ArrivalsComponent for now.
*/

// test framework dependencies
import {async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// app dependencies
import {AppModule} from './../../../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
import {ArrivalsComponent} from './../../../arrivals/arrivals.component';
import {LatLng} from './../../../core/latlng.model';
import {LocationService} from './../../../locationsearch/location.service';
import {RejseplanenAgency} from './../core/rejseplanen-agency.model';
import {RejseplanenArrivalService} from './rejseplanen-arrival.service';
import {RejseplanenStop} from './../core/rejseplanen-stop.model';
import {RejseplanenTrip} from './../core/rejseplanen-trip.model';
import {StopTime} from './../../../core/stop-time.model';

// globals
let fixture: ComponentFixture<ArrivalsComponent>;
let arrivalService: RejseplanenArrivalService;

describe('service RejseplanenArrivalService', () => {

	beforeEach(async(() => { // async b/c calling compileComponents()
		// create mocks
		class fakeLocationService {}
		class fakeRouter {}
		class fakeStop {}
		
		// initialize test bed
		TestBed.configureTestingModule({
		//declarations: [ArrivalsComponent], // unnescessary when also importing AppModule
			imports: [
			AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
			// along with the module's components
			],
			providers: [ // provide injected dependencies, fake (preferred) or real
				RejseplanenArrivalService,
			{provide: LocationService, useValue: fakeLocationService},
			{provide: Router, useValue: fakeRouter},
			{provide: RejseplanenStop, useValue: fakeStop}
			] 
		})
		.compileComponents();  // inline template and css

		// get references (only using service here)
		fixture = TestBed.createComponent(ArrivalsComponent);
		arrivalService = fixture.debugElement.injector.get(RejseplanenArrivalService);
	}));

	it('can get a list of arrivals at a location, parsed into common object model', (done) => {
		let stop: RejseplanenStop = new RejseplanenStop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
		function _validateTrip(trip: RejseplanenTrip) { // verify parsing of trip into app's object model
			// trip
			expect(trip instanceof RejseplanenTrip).toBe(true);
			expect(typeof trip.cancelled()).toBe('boolean');
			expect(trip.detailsUrl().indexOf('http')).toBeGreaterThan(-1);
			expect(typeof trip.direction()).toBe('boolean');
			// route
			expect(typeof trip.route().iconAltText()).toBe('string');
			expect(typeof trip.route().iconUrl()).toBe('string');
			expect(typeof trip.route().name()).toBe('string');
			expect(typeof trip.route().type()).toBe('number');
			// agency
			let agency: RejseplanenAgency = <RejseplanenAgency>trip.route().agency();
			if (agency) {
			expect(typeof agency.iconAltText()).toBe('string');
			expect(typeof agency.iconUrl()).toBe('string');
			expect(typeof agency.name()).toBe('string');
			}
			// stopTimes
			expect(trip.stopTimes().length).toBeGreaterThan(1);
			let arrival: StopTime = trip.stopTimes()[trip.stopTimes().length - 1];
			expect(arrival).toBeDefined();
			expect(arrival.arrivalPlanned().constructor).toBe(Date);
			expect(typeof arrival.stop().name()).toBe('string');
		}
		
		arrivalService.fetchArrivals(stop, new Date(), true, false, false)
			.then((result: RejseplanenTrip[]) => {
			expect(result.length).toBeGreaterThan(0);
			result.forEach((trip: RejseplanenTrip) => {_validateTrip(trip);});
			done();
			})
			.catch((e: Error) => {
				console.log(e);
			})
		expect(true).toBe(true);
	});

	it('can get the details for an arrival', (done) => {
		let stop: RejseplanenStop = new RejseplanenStop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
		arrivalService.fetchArrivals(stop, new Date(), true, false, false)
			.then((result: RejseplanenTrip[]) => {
				expect(result.length).toBeGreaterThan(0);
				let arrival = result[0];
				expect(arrival instanceof RejseplanenTrip).toBe(true);
				while(arrival.notes().pop()) {} // clear data updated by details service 
				expect(arrival.notes().length).toBe(0);
				while(arrival.stopTimes().pop()) {}
				expect(arrival.stopTimes().length).toBe(0);
				arrivalService.fetchArrivalDetails(arrival)
					.then(() => {
						expect(arrival.stopTimes().length).toBeGreaterThan(0);
						expect(arrival.stopTimes()[0] instanceof StopTime).toBe(true);
						if (arrival.notes().length) {
							expect(arrival.notes()[0].text).toBeDefined();
						}
						done();
					})
					.catch((e: Error) => {
						console.log(e);
						done();
					})
			})
			.catch((e: Error) => {
				console.log(e);
       			done();
			})
		expect(true).toBe(true);
	});
});