'use strict';

/*KNOWN ISSUE:
* Not sure how to instatiate the service on its own, so piggybagging on JourneySearchComponent for now.
 */

// test framework dependencies
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// app dependencies
import {AppModule} from './../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
import {Device} from './../util/device.class';
import {JourneySearchComponent} from './../journeyplanner/journey-search.component';
import {LocationService} from './location.service';
import {Place} from './../core/place.model';
import {Stop} from './../core/stop.model';

// globals
let defaultTimeOut: number = jasmine.DEFAULT_TIMEOUT_INTERVAL;
let fixture: ComponentFixture<JourneySearchComponent>;
let locationService: LocationService;

describe('service LocationService', () => {
 beforeAll(() => {
	 jasmine.DEFAULT_TIMEOUT_INTERVAL = 8000;
 })
 
 beforeEach(() => {
    // create mocks
    class fakeDevice {
		public isMobile(): boolean {return true;}
	}
	class fakeRouter {}
    class fakeStop {}
    
    // initialize test bed (pretty slow, optimize later)
    TestBed.configureTestingModule({
    //declarations: [ArrivalsComponent], // unnescessary when also importing AppModule
      imports: [
        AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
                  // along with the module's components
      ],
      providers: [ // provide injected dependencies, fake (preferred) or real
        {provide: Device, useValue: fakeDevice}, // used in template, not in main class
		LocationService,
        {provide: Router, useValue: fakeRouter},
		{provide: Stop, useValue: fakeStop}
      ] 
    })
    .compileComponents();  // inline template and css
	
    // get references (only using service here)
    fixture = TestBed.createComponent(JourneySearchComponent);
    locationService = fixture.debugElement.injector.get(LocationService);
  });
	
	it('can get a list of locations matching a user entry', (done) => {
		locationService.fetchLocations('valby', false)
			.then(function(result: Place[]) {
				expect(result.length).toBeGreaterThan(0);
				expect(result[0] instanceof Place).toBe(true);
				expect(result[0].name()).toBeDefined();
				done();
			})
			.catch(function(e: any) {
				console.log(e);
			});
		expect(true).toBe(true);
	});

	 afterAll(() => {
		 jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeOut;
	 })
});