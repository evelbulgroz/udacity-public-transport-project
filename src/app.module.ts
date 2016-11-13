'use strict';

// import angular stuff
	import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
	import { BrowserModule } from '@angular/platform-browser';
	import { FormsModule } from '@angular/forms';
	import {MdInputModule} from '@angular2-material/input';
	import {MdListModule} from '@angular2-material/list';
	import { PolymerElement } from '@vaadin/angular2-polymer';
	void PolymerElement('iron-icon'); // initialize PolymerElements globally

// import app components, modules and utils
	import {AboutComponent} from './about/about.component';
	import {AppComponent} from './app.component';
	import {AppRoutingModule} from './app-routing.module';
	import {ArrivalsComponent} from './arrivals/arrivals.component';
	import {CacheWorker} from './offline/cache.worker.class';
	import {DeparturesComponent} from './departures/departures.component';
	import {ErrorMessageComponent} from './util/error-message.component';
	import {JourneyComponent} from './journeyplanner/journey.component';
	import {JourneyDetailsComponent} from './journeyplanner/journey-details.component';
	import {JourneySearchComponent} from './journeyplanner/journey-search.component';
	import {LaunchComponent} from './startup/launch.component';
	import {LocalStorage} from './offline/local-storage.class';
	import {ProgressIndicatorComponent} from './util/progress-indicator.component';

// import core app classes for use in classMap
	// - models
	import {Agency} from './core/agency.model';
	import {Journey} from './core/journey.model';
	import {LatLng} from './core/latlng.model';
	import {Leg} from './core/leg.model';
	import {Place} from './core/place.model';
	import {Route} from './core/route.model';
	import {StopTime} from './core/stop-time.model';
	import {Stop} from './core/stop.model';
	import {Trip} from './core/trip.model';
	// - services
	import {ArrivalService} from './arrivals/arrival.service';
	import {DepartureService} from './departures/departure.service';
	import {JourneyService} from './journeyplanner/journey.service';
	import {LocationService} from './locationsearch/location.service';


// import concrete API references; this is the only point where the specifics are known/edited
	// - models
	import {RejseplanenAgency as APIagency} from './api/rejseplanen/core/rejseplanen-agency.model';
	import {RejseplanenJourney as APIjourney} from './api/rejseplanen/core/rejseplanen-journey.model';
	import {RejseplanenLeg as APIleg} from './api/rejseplanen/core/rejseplanen-leg.model';
	import {RejseplanenPlace as APIplace} from './api/rejseplanen/core/rejseplanen-place.model';
	import {RejseplanenRoute as APIroute} from './api/rejseplanen/core/rejseplanen-route.model';
	import {RejseplanenStop as APIstop} from './api/rejseplanen/core/rejseplanen-stop.model';
	import {RejseplanenTrip as APItrip} from './api/rejseplanen/core/rejseplanen-trip.model';
	// - services
	import {RejseplanenArrivalService as apiArrivalService} from './api/rejseplanen/arrivals/rejseplanen-arrival.service';
	import {RejseplanenDepartureService as apiDepartureService} from './api/rejseplanen/departures/rejseplanen-departure.service';
	import {RejseplanenFactory as apiFactory} from './api/rejseplanen/core/rejseplanen-factory.model';
	import {RejseplanenJourneyService as apiJourneyService} from './api/rejseplanen/journeyplanner/rejseplanen-journey.service';
	import {RejseplanenLocationService as apiLocationService} from './api/rejseplanen/locationsearch/rejseplanen-location.service';
	import {RejseplanenLocationService} from './api/rejseplanen/locationsearch/rejseplanen-location.service';

@NgModule({
	declarations: [ // the module's view classes (i.e. components, directives and pipes)
		AboutComponent,
		AppComponent,
		ArrivalsComponent,
		DeparturesComponent,
		ErrorMessageComponent,
		JourneyComponent,
		JourneyDetailsComponent,
		JourneySearchComponent,
		LaunchComponent,
		ProgressIndicatorComponent
	],
	// exports [], subset of declarations that should be visible and usable in the component templates of other modules
	imports:[ //other modules whose exported classes are needed by component templates declared in this module
		BrowserModule,
		FormsModule,
		MdInputModule, // may no longer be needed, remove and see what breaks
		MdListModule,
		//routing
		AppRoutingModule
	],
	providers: [ // creators of services that this module contributes to the global collection of services
		// providing api specific services here so that core components won't have to know about them
		// using generic names so only import statements here need to know the specifics 
		apiArrivalService,
		apiDepartureService,
		apiJourneyService,
		apiLocationService,
		RejseplanenLocationService,
		ArrivalService, //provide key services here so master and detail components may share the same instance and its state
		CacheWorker,
		DepartureService,
		JourneyService 
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA], // suppress error messages caused by use of (Polymer) web components
	bootstrap: [ // the main application view (root component) that hosts all other app views
		AppComponent
	]
})

export class AppModule {}

// Export mapping of class names to constructors for dynamic lookup and API hiding
export const classMap = ((): any => {
	let map: any = {};
	map.factories = {};
	map.factories['apiFactory'] = apiFactory;
	map.models = {};
	map.models['Agency'] = Agency;
	map.models[(new APIagency(undefined)).className()] = APIagency;
	map.models['Journey'] = Journey;
	map.models[(new APIjourney(undefined)).className()] = APIjourney;
	map.models['LatLng'] = LatLng;
	map.models['Leg'] = Leg;
	map.models[(new APIleg(undefined)).className()] = APIleg;
	map.models['Place'] = Place;
	map.models[(new APIplace(undefined)).className()] = APIplace;
	map.models['Route'] = Route;
	map.models[(new APIroute(undefined)).className()] = APIroute;
	map.models['StopTime'] = StopTime;
	map.models['Stop'] = Stop;
	map.models[(new APIstop(undefined)).className()] = APIstop;
	map.models['Trip'] = Trip;
	map.models[(new APItrip(undefined)).className()] = APItrip;
	map.services = {};
	map.services['ArrivalService'] = ArrivalService;
	map.services['apiArrivalService'] = apiArrivalService;
	map.services['DepartureService'] = DepartureService;
	map.services['apiDepartureService'] = apiDepartureService;
	map.services['JourneyService'] = JourneyService;
	map.services['apiJourneyService'] = apiJourneyService;
	map.services['LocationService'] = LocationService;
	map.services['apiLocationService'] = apiLocationService;
	return map;
})();

export const preferences = {
	cacheWorkerUrl: './cache.worker.js',
	defaultToastDuration: 5000,
	localStoragePrefix: 'dk.ulrikgade.sr.webdev.public.transport.app',
	proxyUrlPrefix: 'http://localhost:3000/add/cors/http://'
	//proxyUrlPrefix: 'http://localhost:1337/',
	//proxyUrlPrefix: 'http://192.168.1.109:3000/add/cors/http://',
}

// Export reference to local storage handler;
// place here to reduce overhead and allow for async delay when setting up storage
// TODO: Try again to use dependency injection
export const localStorage: LocalStorage = new LocalStorage();