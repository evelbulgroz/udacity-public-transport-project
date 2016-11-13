'use strict';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import {AboutComponent} from './about/about.component';
import {ArrivalsComponent} from './arrivals/arrivals.component';
import {DeparturesComponent} from './departures/departures.component';
import {JourneyComponent} from './journeyplanner/journey.component';
import {JourneyDetailsComponent} from './journeyplanner/journey-details.component';
import {LaunchComponent} from './startup/launch.component';

@NgModule({
	imports: [ 
		RouterModule.forRoot([
			{path: '', redirectTo: '/startup', pathMatch: 'full'}, //
			{path: 'sr-webdev-public-transport-app/src', redirectTo: '/startup'}, // workarounds for IE11 when not running app at root of domain (e.g. during development)
			{path: 'sr-webdev-public-transport-app/build', redirectTo: '/startup'},
			{path: 'localhost:9080/src', redirectTo: '/startup'},
			{path: 'localhost:9080/build', redirectTo: '/startup'},
			{path: 'about', component: AboutComponent, data: {title: 'About'}},
			{path: 'arrivals', component: ArrivalsComponent, data: {title: 'Arrivals'}},
			{path: 'departures', component: DeparturesComponent, data: {title: 'Departures'}},
			{path: 'journey/:id', component: JourneyDetailsComponent, data: {title: 'Journey Details', isChildView: true}},
			{path: 'planner', component: JourneyComponent, data: {title: 'Journey Planner', root: true}},
			{path: 'startup', component: LaunchComponent, data: {title: 'Public Transit App'}}
			//{ path: '**', component: PageNotFoundComponent }
		])
	],
	exports: [RouterModule]
})
export class AppRoutingModule {}