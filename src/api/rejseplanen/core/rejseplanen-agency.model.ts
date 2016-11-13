'use strict';

import {Agency} from './../../../core/agency.model';
import {ITransitAPIProduct} from './../../../core/transit-product.interface';

/** classdesc Describes a public transit agency. An agency operates a number of Routes, e.g. metro lines. 
 * Basically exists to provide custom parsing of JSON from Rejseplanen.dk into generic Agency type.
 */
export class RejseplanenAgency extends Agency implements ITransitAPIProduct{
	public constructor(apiId: string, name: string, iconUrl?: string, iconAltText?: string);
	public constructor(modelId: number);
	public constructor() {
		super(arguments[0], arguments[1], arguments[2], arguments[3]);
		this._className = 'RejseplanenAgency';
	}


	/** Creates agency by parsing API service JSON.
	 * Expects an arrival or departure object literal, or a journey leg object literal
	*/
    public createProduct(json: any): RejseplanenAgency {
		// helper function
		function _parseAgency(json: any): any {
			let name = json.name && json.name.toLowerCase ? json.name.toLowerCase() : undefined,
			type = json.type && json.type.toLowerCase ? json.type.toLowerCase() : undefined,
			dsb = {name: 'DSB', iconUrl: 'images/api-rejseplanen-agency-dsb.png', iconAltText: 'DSB'},
			metro = {name: 'Metro', iconUrl: 'images/api-rejseplanen-agency-metro.png', iconAltText: 'Metro'},
			stog = {name: 'S-tog', iconUrl: 'images/api-rejseplanen-agency-stog.png', iconAltText: 'S-tog'};
			// Work around bug in Rejseplanen json
			if (type && type === 'tog' && name && name.substr(0,2) === 're') {return dsb;}
			//..else proceed normally
			let typeMap: any = 
			{
				ic: dsb,
				lyn: dsb,
				m: metro,
				reg: dsb,
				s: stog,
				//bus: '',
				//exp: '',
				//nb: '',
				//tb: '',
				//f: ''
			};
			return typeMap[type];
		}
		let details = _parseAgency(json);
		return details ? 
		  	new RejseplanenAgency(
				details.id,
				details.name,
				details.iconUrl,
				details.iconAltText)
			: undefined;
    }

    /** Gets product (i.e. class) name (read-only)*/
    public productName(): string {
        return 'RejseplanenAgency';
    }
}