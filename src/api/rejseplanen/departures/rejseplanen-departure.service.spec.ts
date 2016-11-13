'use strict';

/*KNOWN ISSUE:
* Not sure how to instntiate the service on its own, so piggybagging on DeparturesComponent for now.
	*/

// test framework dependencies
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// app dependencies
import {AppModule} from './../../../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
import {DeparturesComponent} from './../../../departures/departures.component';
import {LatLng} from './../../../core/latlng.model';
import {LocationService} from './../../../locationsearch/location.service';
import {RejseplanenAgency} from './../core/rejseplanen-agency.model';
import {RejseplanenDepartureService} from './rejseplanen-departure.service';
import {RejseplanenStop} from './../core/rejseplanen-stop.model';
import {RejseplanenTrip} from './../core/rejseplanen-trip.model';
import {StopTime} from './../../../core/stop-time.model';

// globals (only using servuce here)
let fixture: ComponentFixture<DeparturesComponent>;
let departureService: RejseplanenDepartureService;

describe('service RejseplanenDepartureService', () => {
	
	beforeEach(async(() => { // async b/c calling compileComponents()
		// create mocks
		class fakeLocationService {}
		class fakeRouter {}
		class fakeStop {}
		
		// initialize test bed
		TestBed.configureTestingModule({
		//declarations: [DeparturesComponent], // unnescessary when also importing AppModul
		  imports: [
			AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
					  // along with the module's components
		  ],
		  providers: [ // provide injected dependencies, fake (preferred) or real
		   	RejseplanenDepartureService,
			{provide: LocationService, useValue: fakeLocationService},
			{provide: Router, useValue: fakeRouter},
			{provide: RejseplanenStop, useValue: fakeStop}
		  ] 
		})
		.compileComponents();  // inline template and css

		// get references (only using service here)
		fixture = TestBed.createComponent(DeparturesComponent);
		departureService = fixture.debugElement.injector.get(RejseplanenDepartureService);
	}));

	it('can get a list of departures at a location, parsed into common object model', (done) => {
		
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
			let departure: StopTime = trip.stopTimes()[0];
			expect(departure).toBeDefined();
			expect(departure.departurePlanned().constructor).toBe(Date);
			expect(typeof departure.stop().name()).toBe('string');
		}
		
		departureService.fetchDepartures(stop, new Date(), true, false, false)
			.then(function(result: RejseplanenTrip[]) {
				expect(result.length).toBeGreaterThan(0);
				result.forEach(trip => {
			  _validateTrip(trip);
			})
				done();
			})
			.catch(function(e: Error) {
				console.log(e);
			})
		expect(true).toBe(true);
	});

	it('can get the details for a departure', (done) => {
		let stop: RejseplanenStop = new RejseplanenStop('008600053', 'Aarhus H', new LatLng(10.204761, 56.150444));
		departureService.fetchDepartures(stop, new Date(), true, false, false)
			.then((result: RejseplanenTrip[]) => {
				expect(result.length).toBeGreaterThan(0);
				let departure = result[0];
				expect(departure instanceof RejseplanenTrip).toBe(true);
				while(departure.notes().pop()) {} // clear data updated by details service 
				expect(departure.notes().length).toBe(0);
				while(departure.stopTimes().pop()) {}
				expect(departure.stopTimes().length).toBe(0);
				departureService.fetchDepartureDetails(departure)
					.then(() => {
						expect(departure.stopTimes().length).toBeGreaterThan(0);
						expect(departure.stopTimes()[0] instanceof StopTime).toBe(true);
						if (departure.notes().length) {
							expect(departure.notes()[0].text).toBeDefined();
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