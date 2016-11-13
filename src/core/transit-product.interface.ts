'use strict';

/** Describes a generic product in the factory pattern */
export interface ITransitAPIProduct {
	createProduct(json: any): ITransitAPIProduct;
	productName(): string;
}