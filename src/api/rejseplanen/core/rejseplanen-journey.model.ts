'use strict';

import {Journey} from './../../../core/journey.model';
import {RejseplanenLeg} from './rejseplanen-leg.model';
import {ITransitAPIProduct} from './../../../core/transit-product.interface';

/** classdesc Describes a passenger journey combining one or more legs on individual routes 
 * Basically exists to provide custom parsing of JSON from Rejseplanen.dk into generic Journey type.
 */
export class RejseplanenJourney extends Journey implements ITransitAPIProduct{
	
	public constructor(modelId: number);
	public constructor();
	public constructor() {
		super(arguments.length === 1 ? arguments[0] : undefined);
		this._className = 'RejseplanenJourney';
	}

	/** Creates journey by parsing API service JSON  */
    public createProduct(json?: any): RejseplanenJourney {
        let journey = new RejseplanenJourney();
		let createLeg = RejseplanenLeg.prototype.createProduct;
		if (json && json.Leg) { // search yielded result
			let legs = json.Leg;
			if (legs.length) { // multiple legs
				legs.forEach((leg: any) => {
					void journey.legs().push(createLeg(leg));
				})
			}
			else { // single leg
				void journey.legs().push(createLeg(legs));
			}
		}
		return journey;
    }

    /** Gets product (i.e. class) name (read-only)*/
    public productName(): string {
        return this._className;
    }
}