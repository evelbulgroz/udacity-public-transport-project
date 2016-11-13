'use strict';

import {Model} from './model';
import {Route} from './route.model';

/** @classdesc Describes a public transit agency. An agency operates a number of Routes, e.g. metro lines.
 * Partial implementation of generic Agency type defined by the Google Static Transit API (GTFS).
 * See: https://developers.google.com/transit/gtfs/reference/agency-file
*/
export class Agency extends Model {
	protected _iconUrl: string;
	protected _iconAltText: string;
	protected _name: string;
	protected _routes: Array<Route> = [];
	
	/** Creates a new Agency, or prepares existing Agency for re-instantiation from storage
	 * if provided with a single integer parameter that is the Agency's unique id
	 * @param {integer} modelId of Agency to be re-instantiated from storage (optional)
	 */
	public constructor(apiId: string, _name: string, _iconUrl?: string, _iconAltText?: string);
	public constructor(modelId: number);
	public constructor() {
		super(typeof arguments[0] === 'number' // modelId / apiId
				&& arguments[1] === undefined // name
				&& arguments[2] === undefined // iconUrl
				&& arguments[3] === undefined // iconAltText
				? arguments[0] // modelId
				: undefined
		);
		this._className = 'Agency';
		if (typeof arguments[0] !== 'number' || arguments[0] !== parseInt(arguments[0])) {  // normal instantiation
			this._apiId = arguments[0];
			this._name = arguments[1];
			this._iconUrl = arguments[2];
			this._iconAltText = arguments[3];
		}
	}
	
	/** Adds route to agency, and agency to route */
	public addRoute(route: Route): void {
		void this._routes.push(route);
		void route.agency(this);
	}

	/** Gets route by name attribute  (not sure if this is necessary) */
	public getRouteByName(name: string): Route {
		return this._routes.find((route: Route) => route.name() === name);
	}

	/** Gets API id (read-only)
	 * Note: API ids from Restful interfaces may be meaningless beyond the current session.
	 * So, be careful if/when storing models for later/offline use.
	 */
	public apiId(): string {return this._apiId;}

	/** Gets or sets icon url */
	public iconUrl(url: string): string;
	public iconUrl(): string;
	public iconUrl(): string {
		if (arguments.length > 0) {
			this._iconUrl = arguments[0];
		}
		return this._iconUrl;
	}

	/** Gets or sets icon alt text */
	public iconAltText(url: string): string;
	public iconAltText(): string;
	public iconAltText(): string {
		if (arguments.length > 0) {
			this._iconAltText = arguments[0];
		}
		return this._iconAltText;
	}

	/** Gets name (read-only) */
	public name(): string {return this._name;}

	/** Gets routes (read-only) */
	public routes(): Route[] {return this._routes;}

	/** Returns internal state as JSON object */
	public toJSON(): any {
		let json: any = super.toJSON();
		if (this._name) {json._name = this._name;}
		if (this._iconUrl) {json._iconUrl = this._iconUrl;}
		if (this._iconAltText) {json._iconAltText = this._iconAltText;}
		return json;
	}
}