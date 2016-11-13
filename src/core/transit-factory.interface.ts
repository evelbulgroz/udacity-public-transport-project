'use strict';

import {ITransitAPIProduct} from './transit-product.interface';
//import {Stop} from './stop.model';

/** Describes a generic factory in the factory pattern */
export interface ITransitAPIFactory {
	createProduct(productName: string, json: any): ITransitAPIProduct;
	registerProduct(productName: string, product: ITransitAPIProduct): void;
}