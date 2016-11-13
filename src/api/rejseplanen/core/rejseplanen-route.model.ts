'use strict';

import {Route} from './../../../core/route.model';
import {ITransitAPIProduct} from './../../../core/transit-product.interface';

/** classdesc Describes the equivalent of a "Line" in a public transportation system. 
 * Basically exists to provide custom parsing of JSON from Rejseplanen.dk into generic Route type.
 */
export class RejseplanenRoute extends Route implements ITransitAPIProduct{
	
	public constructor(apiId: string, name: string, type?: Number, iconUrl?: string, iconAltText?: string);
	public constructor(modelId: number);
	public constructor() {
		super(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
			this._className ='RejseplanenRoute';
	}

	/** Creates route by parsing API service JSON  */
    public createProduct(json: any): RejseplanenRoute {
       let route = new RejseplanenRoute(
			json.id,
			json.name,
			this.parseRouteType(json.type),
			this._parseRouteIcon(json),
			this._parseRouteIconAltText(json)
		);
		return route;
    }

	// Parses route icon from json
	private _parseRouteIcon(json: any): string {
		let name = json.name && json.name.toLowerCase ? json.name.toLowerCase() : undefined;
		let type = json.type && json.type.toLowerCase ? json.type.toLowerCase() : undefined;
		
		// Check for bug in the service json for a regional train...
		if (name && name.substring(0,2) === 're' && type && type === 'tog') {return 'images/api-rejseplanen-route-re.png';}
		
		//... else try to match on route name
		let routeMap =
		{
			a: 'api-rejseplanen-route-a.png',
			b: 'api-rejseplanen-route-b.png',
			bx: 'api-rejseplanen-route-bx.png',
			c: 'api-rejseplanen-route-c.png',
			e: 'api-rejseplanen-route-e.png',
			f: 'api-rejseplanen-route-f.png',
			h: 'api-rejseplanen-route-h.png',
			'metro m1': 'api-rejseplanen-route-m1.png',
			'metro m2': 'api-rejseplanen-route-m2.png',
			'metro m3': 'api-rejseplanen-route-m3.png',
			'metro m4': 'api-rejseplanen-route-m4.png',

			'togbus blå': 'api-rejseplanen-bus.png',
			'togbus grøn': 'api-rejseplanen-bus.png',
			'togbus rød': 'api-rejseplanen-bus.png'
		},
		icon: string = routeMap[name];
		if (icon) {return 'images/' + icon;}
		
		// ...else try match on generic service type... 
		let typeMap = 
		{
			ic: 'api-rejseplanen-route-ic.png',
			lyn: 'api-rejseplanen-route-icl.png',
			reg: 'api-rejseplanen-route-re.png',
			tog: 'api-rejseplanen-route-tog.png',
			
			bus: 'api-rejseplanen-bus.png',
			exp: 'api-rejseplanen-bus.png',
			nb: 'api-rejseplanen-bus.png',
			tb: 'api-rejseplanen-bus.png',
			f: 'api-rejseplanen-ferry.png',

			walk: 'walk.png'
		};
		icon = typeMap[type];
		if (icon) {return 'images/' + typeMap[type]};

		//... else return undefined
		console.log('"' + name + '" missing icon');
		return undefined;
	}

	// Parses route icon alt text from json
	private _parseRouteIconAltText(json: any): string {
		let name = json.name && json.name.toLowerCase ? json.name.toLowerCase() : undefined,
		icon: string,
		routeMap =
		{
			a: 'Line A',
			b: 'Line B',
			bx: 'Line Bx',
			c: 'Line C',
			e: 'Line E',
			f: 'Line F',
			h: 'Line H',
			'metro m1': 'Metro M1',
			'metro m2': 'Metro M2',
			'metro m3': 'Metro M3',
			'metro m4': 'Metro M4'
		};
		
		// If defined, return icon that matches route name (e.g. S-tog line 'H')...
		icon = routeMap[name];
		if (icon) { return icon;}
		
		// ...else return match to generic service type, or empty string 
		let type = json.type && json.type.toLowerCase ? json.type.toLowerCase() : undefined,
		typeMap = 
		{
			ic: 'InterCity',
			lyn: 'InterCity Lyn',
			reg: 'Regional train',
			tog: 'Train',

			bus: 'Bus',
			exp: 'Expresbus',
			nb: 'Nightbus',
			tb: 'Telebus',
			f: 'Ferry',

			walk: 'Walk'
		};
		return typeMap[type] ? typeMap[type] : '';
	}

	/** Parses arrival/departure type provided by Rejseplanen.dk API into valid Route type. */
	public parseRouteType(type: string): number {
		type = type.toLocaleLowerCase()
		if (['ic', 'lyn', 'reg', 'tog'].indexOf(type) > -1) {
			return Route.types().rail;
		}
		else if (['bus', 'exb', 'nb', 'tb'].indexOf(type) > -1) {
			return Route.types().bus;
		}
		else if (['s', 'm'].indexOf(type) > -1) {
			return Route.types().subway;
		}
		else if (type === 'f') {
			return Route.types().ferry;
		}
		else if (type === 'walk') {
			return Route.types().pedestrian;
		}
		else {
			return undefined;
		}
	}

	/** Gets product (i.e. class) name (read-only)*/
    public productName(): string {
        return this._className;
    }
}