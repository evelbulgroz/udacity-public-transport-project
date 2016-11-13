'use strict';

import {ITransitAPIProduct} from './../../../core/transit-product.interface';
import {Leg} from './../../../core/leg.model';
import {Note} from './../../../core/note.interface';
import {RejseplanenFactory} from './rejseplanen-factory.model';
import {RejseplanenRoute} from './rejseplanen-route.model';
import {RejseplanenStop} from './rejseplanen-stop.model'; // todo: use this instead of Stop when creating Stops for legs
import {RejseplanenTrip} from './rejseplanen-trip.model';
import {StopTime} from './../../../core/stop-time.model';

/** @classdesc Describes a leg on a passenger journey along a route.
 * Basically exists to provide custom parsing of JSON from Rejseplanen.dk into generic Leg type.
 */
export class RejseplanenLeg extends Leg implements ITransitAPIProduct {
	public constructor(origin: StopTime, destination: StopTime, detailsUrl?: string, notes?: Array<Note>);
	public constructor(modelId: number);
	public constructor() {
		super(arguments[0], arguments[1], arguments[2], arguments[3]);
		this._className = 'RejseplanenLeg';
	}

	public createProduct(json: any) : RejseplanenLeg {
		// create leg
			let leg: RejseplanenLeg = new RejseplanenLeg(
				new StopTime( // origin
					json.Origin.routeIdx,
					undefined,
					RejseplanenFactory.parseAPIDate(json.Origin.date, json.Origin.time),
					undefined,
					json.Origin.track,
					json.Origin.rtTrack),
				new StopTime( // destination
					json.Destination.routeIdx,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					json.Destination.date ? RejseplanenFactory.parseAPIDate(json.Destination.date, json.Destination.time) : undefined,
					json.Destination.rtDate ? RejseplanenFactory.parseAPIDate(json.Destination.rtDate, json.Destination.rtTime) : undefined,
					json.Destination.track,
					json.Destination.rtTrack),
				json.JourneyDetailRef ? 
				json.JourneyDetailRef.ref.indexOf('%') > -1 ? // decode URI if mangled e.g. by proxu server
					decodeURIComponent(json.JourneyDetailRef.ref):
					json.JourneyDetailRef.ref :
				undefined // details reference (url)
			);
		// parse Trip (and Route)
			let routeName: string, tripName: string;
			if (['ic', 'icl', 'lyn', 'reg'].indexOf(json.type.toLowerCase()) > -1) {
				// The api does not expose a strong Route concept for trains run by the Danish railway authority (DSB),
					// nor does one seem to exist, so simply parse icon and use json.type for name
				routeName = json.type; // route name is type, route has icons
				tripName = json.name; // name is for trip (e.g. 'IC 42')
			}
			else if (['m', 's', 'tog'].indexOf(json.type.toLowerCase()) > -1) {
				// The Copenhagen Metro and S trains fit better with the generic "route" concept,
					// but no meaningful info about trips on these routes is exposed through the api
					// (trips are scheduled by apparently anonymous, fixed time intervals)
				routeName = json.name; // name is for route, route has icons
				tripName = undefined; // trip has no data
			}
			let trip: RejseplanenTrip = new RejseplanenTrip(undefined, tripName, false);
			let route: RejseplanenRoute = RejseplanenRoute.prototype.createProduct({name: routeName, type: json.type});
			void route.addTrip(trip);  // assign trip and route to each other
			void trip.addStopTime(leg.origin()); // add origin and destination to Trip
			void trip.addStopTime(leg.destination());

					
		// add Stop to origin
			void leg.origin().stop(new RejseplanenStop(
				json.Origin.routeIdx,
				json.Origin.name,
				undefined,
				json.Origin.type.toLowerCase() === 'st' 
			));
		
		// add Stop to destination
			void leg.destination().stop(new RejseplanenStop(
				json.Destination.routeIdx,
				json.Destination.name,
				undefined,
				json.Destination.type.toLowerCase() === 'st' 
			));
		
		// parse notes
			if (json.Notes) { // service returned one or more notes
				json.Notes.text.split(';').forEach((text: string) => {
					leg.addNote({text: text, from: undefined, to: undefined});
				});
			}
		return leg;
	}

    /** Gets product (i.e. class) name (read-only)*/
    public productName(): string {
        return this._className;
    }
}