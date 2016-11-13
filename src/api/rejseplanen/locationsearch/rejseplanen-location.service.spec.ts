'use strict';

/*KNOWN ISSUE:
* Not sure how to instatiate the service on its own, so piggybagging on JourneySearchComponent for now.
 */

// test framework dependencies
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// app dependencies
import {AppModule} from './../../../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
import {Device} from './../../../util/device.class';
import {JourneySearchComponent} from './../../../journeyplanner/journey-search.component';
import {LatLng} from './../../../core/latlng.model';
import {Place} from './../../../core/place.model';
import {RejseplanenLocationService} from './rejseplanen-location.service';
import {RejseplanenStop} from './../core/rejseplanen-stop.model';

// globals
let defaultTimeOut: number = jasmine.DEFAULT_TIMEOUT_INTERVAL;
let fixture: ComponentFixture<JourneySearchComponent>;
let locationService: RejseplanenLocationService;

describe('service RejseplanenLocationService', () => {
 beforeAll(() => {
	 jasmine.DEFAULT_TIMEOUT_INTERVAL = 8000;
 })
 
 beforeEach(async(() => { // async b/c calling compileComponents()
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
		RejseplanenLocationService,
        {provide: Router, useValue: fakeRouter},
		{provide: RejseplanenStop, useValue: fakeStop}
      ] 
    })
    .compileComponents(); // inline template and css

    // get references (only using service here)
    fixture = TestBed.createComponent(JourneySearchComponent);  
    locationService = fixture.debugElement.injector.get(RejseplanenLocationService);
  }));
	
	it('can get a list of locations matching a user entry', (done) => {
		
		function _validateLocation(location: any): void {
			expect(location instanceof Place).toBe(true);
			expect(typeof location.apiId()).toBe('string');
			expect(typeof location.name()).toBe('string');
			expect(location.location() instanceof LatLng).toBe(true);
			expect(typeof location.location().lat()).toBe('number');
			expect(typeof location.location().lng()).toBe('number');
		}

		locationService.fetchLocations('valby', false)
			.then(function(result: Place[]) {
				expect(result.length).toBeGreaterThan(0);
				result.forEach((location: any) => {
					_validateLocation(location);
				});
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