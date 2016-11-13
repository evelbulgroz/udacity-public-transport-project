'use strict';

/* KNOWN BUG:
* Causes search form to display below test listing. No clue why, but it doesn't seem to impede the tests.
 */

// test framework dependencies
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, EventEmitter } from '@angular/core';
//import { Component } from '@angular/core';
import { Router } from '@angular/router';

// app dependencies
import {AppModule} from './../app.module'; // required for CUSTOM_ELEMENTS_SCHEMA, else Polymer elements cause fail
import {Device} from './../util/device.class';
//import {LatLng} from './../core/latlng.model';
import {LocationList} from './../locationsearch/location.mock';
import {JourneySearchComponent} from './journey-search.component';
import {LocationService} from './../locationsearch/location.service';
import {Place} from './../core/place.model';
//import {Stop} from './../core/stop.model';

// globals
let comp: JourneySearchComponent;
let fixture: ComponentFixture<JourneySearchComponent>;
let el: DebugElement;
let locationService: LocationService;

describe('component JourneySearchComponent', () => {
 beforeEach(async(() => { // async b/c calling compileComponents()
    // create mocks
    class fakeDevice {
		public isMobile(): boolean {return true;}
	}
	class fakeLocationService  {
      public getLocations() {
        return LocationList;
      }
    };
    class fakeRouter {}
    class fakePlace {}
    
    // initialize test bed (pretty slow, optimize later)
    TestBed.configureTestingModule({
    //declarations: [ArrivalsComponent], // unnescessary when also importing AppModule
      imports: [
        AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
                  // along with the module's components
      ],
      providers: [ // provide injected dependencies, fake (preferred) or real
        {provide: Device, useValue: fakeDevice}, // used in template, not in main class
		    {provide: LocationService, useValue: fakeLocationService},
        {provide: Router, useValue: fakeRouter},
		    {provide: Place, useValue: fakePlace}
      ] 
    })
    .compileComponents();  // inline template and css

    // get references
    fixture = TestBed.createComponent(JourneySearchComponent);
    comp = fixture.componentInstance; // JourneySearchComponent test instance  
    locationService = fixture.debugElement.injector.get(LocationService);
    el = fixture.debugElement.query(By.css('h1')); // get title DebugElement by element name
  }));

  describe('controller', () => {
    it('has a date that is empty by default', () => {
      // initialization by ngOnInit() does not seem to affect test fixture, so simply test for existence
      expect(comp.date).toBeDefined();
      expect(comp.date).toBe(null);
      expect(comp.datetime).toBeDefined();
      expect(comp.datetime).toBe('');      
    });

    it('has a destination that is empty by default', () => {
      expect(comp.destination).toBeDefined();
      expect(comp.destination).toBe(null);
      expect(comp.destinationId).toBeDefined();
      expect(comp.destinationId).toBe('');
    });

    it('has a collection of destination suggestions that is empty by default', () => {
      expect(comp.destinationSuggestions).toBeDefined();
      expect(comp.destinationSuggestions).toBe(null);
    });

    it('has an origin that is empty by default', () => {
      expect(comp.origin).toBeDefined();
      expect(comp.origin).toBe(null);
      expect(comp.originId).toBeDefined();
      expect(comp.originId).toBe('');
    });

    it('has a collection of origin suggestions that is empty by default', () => {
      expect(comp.originSuggestions).toBeDefined();
      expect(comp.originSuggestions).toBe(null);
    });

  	it('has a flag indicating if a valid set of search criteria has been entered (default is false)', () => {
      expect(comp.valid).toBeDefined();
	    expect(typeof comp.valid).toBe('boolean');
      expect(comp.valid).toBe(false);
    });

    it('can notify its containing component when a search is submitted', () => {
  		expect(comp.onFindJourney.constructor).toBe(EventEmitter);
  	});
  });
  
  describe('service', () => {
    it('can get a list of locations matching a user entry', (done) => {
  		locationService.fetchLocations('Aarhus H', false)
  			.then((result: Place[]) => {
  				expect(result.length).toBeGreaterThan(0);
          expect(result[0] instanceof Place).toBe(true);
  				expect(result[0].apiId()).toBe('008600053');
          expect(result[0].name()).toBe('Aarhus H');
          expect(result[0].location().lat()).toBe(10.204761);
          expect(result[0].location().lng()).toBe(56.150444);
  				done();
  			})
  			.catch(function(e: Error) {
  				console.log(e);
  			})
  		expect(true).toBe(true);
  	});
  });

  describe('user interface (template)', () => {
    let testWindow: Window;

    beforeEach((done) => {
      testWindow = window.open('http://localhost:9080/sr-webdev-public-transport-app/build/');
      testWindow.onload = () => {
       done(); // wait for app to finish loading before running tests
      };
    });
    
    it('has a departure search box labelled "From" that is empty by default', () => {
      fixture.detectChanges(); // trigger change detection to update the view
      let de: any = fixture.debugElement.query(By.css('#origin'));
      expect(de).not.toBe(null);
      let el: any = de.nativeElement;
      expect(el.id).toBe('origin');
      expect(el.label).toBe('From');
      expect(el.hasValue).toBe(false);
      expect(el.inputElement.value).toBe('');
    });

    it('has an arrival search box labelled "To" that is empty by default', () => {
      fixture.detectChanges(); // trigger change detection to update the view
      let de: any = fixture.debugElement.query(By.css('#destination'));
      expect(de).not.toBe(null);
      let el: any = de.nativeElement;
      expect(el.id).toBe('destination');
      expect(el.label).toBe('To');
      expect(el.hasValue).toBe(false);
      expect(el.inputElement.value).toBe('');
    });

    it('has a "Find journey" button that has a search (magnifier) icon and is unavailable by default', () => {
      fixture.detectChanges(); // trigger change detection to update the view
      let de: any = fixture.debugElement.query(By.css('paper-button'));
      expect(de).not.toBe(null);
      let el: any = de.nativeElement;
      expect(el.disabled).toBeDefined();
      expect(el.children[0].icon.toLowerCase()).toBe('search');
      expect(el.children[0].tagName.toLowerCase()).toBe('iron-icon');
      expect(el.textContent).toContain('Find journey');
    });

    // can't figure out how to trigger UI behaviours, fix later
    xit('presents suggestions when user enters 4 or more characters into "From" box', () => {
    });
    
    xit('presents suggestions when user enters 4 or more characters into "To" box', () => {
    });
    
    xit('enables search button when user has selects bot an origin and a destination', () => {
    });

    xit('emits search criteria to containing component when users activates search button', () => {
    });

    afterEach(() => {
      testWindow.close();
    });
    // also error, progress indicator
  });
});