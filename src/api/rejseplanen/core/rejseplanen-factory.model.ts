'use strict';

import {IllegalAccessError} from './../../../util/error.model';
import {ITransitAPIFactory} from './../../../core/transit-factory.interface';
import {ITransitAPIProduct} from './../../../core/transit-product.interface';
import {Message} from './../../../core/message.interface';
import {Note} from './../../../core/note.interface';

//import  * as _ from 'lodash';

export class RejseplanenFactory implements ITransitAPIFactory {
	private _products = {}; // not sure how to create a typed object literal or map
	private static _dstStart: Date = (function() { // cutoff date for daylight savings start in Denmark
		// Local daylight savings time (CEST) starts at 1:00 UTC (i.e. local midnight) on the last Sunday of March
		let d: Date = new Date(), m: number = 3, y: number = d.getFullYear(); void d.setMonth(2);
		// monthLen source: http://stackoverflow.com/questions/315760/what-is-the-best-way-to-determine-the-number-of-days-in-a-month-with-javascript
		let monthLen: number = m===2?y&3||!(y%25)&&y&15?28:29:30+(m+(m>>3)&1);
		void d.setDate(monthLen);
		while (d.getDay() > 0) {
			monthLen -= 1;
			d.setDate(monthLen);
		}
		d.setUTCHours(1, 0, 0, 0);
		return d;
	})();
	private static _dstEnd: Date = (function() { // cutoff date for daylight savings end in Denmark
		// Local daylight savings time (CEST) ends at 1:00 UTC (i.e. local midnight) on the last Sunday of October
		let d: Date = new Date(), m: number = 10, y: number = d.getFullYear(); void d.setMonth(9);
		// monthLen source: http://stackoverflow.com/questions/315760/what-is-the-best-way-to-determine-the-number-of-days-in-a-month-with-javascript
		let monthLen: number = m===2?y&3||!(y%25)&&y&15?28:29:30+(m+(m>>3)&1);
		void d.setDate(monthLen);
		while (d.getDay() > 0) {
			monthLen -= 1;
			d.setDate(monthLen);
		}
		d.setUTCHours(1, 0, 0, 0);
		return d;
	})();

	/** Creates a product whose name property matches type, passing options object along to object class' createProduct method*/
	public createProduct(productName: string, json?: any): ITransitAPIProduct {
		if (this._products[productName] !== undefined) {
			return this._products[productName].createProduct(json);
		}
		throw new ReferenceError('Product ' + productName + ' not found');
	}
	
	/** Register a product by unique name */
	public registerProduct(productName: string, product: ITransitAPIProduct): void {
		if (this._products[productName] === undefined) {
			this._products[productName] = product;
			return;
		}
		throw new IllegalAccessError(productName + ' already registered');
	}

	/** Gets prefix used for naming API variants of core app entities (models, services etc,)	*/
	public static getAPIPrefix(): string {
		return 'Rejseplanen';
	}
	
	/** Converts native date to date format required by Rejseplanen.dk API
	 * Assumes date entry is intended as local Copenhagen time, regardless of device time zone setting
	*/
	public static getAPIDate(date:Date) {
		return date.getDate() + '.' + (date.getMonth() + 1) + '.' + (date.getFullYear() - 2000);
	}

	/** Converts native date to time format required by Rejseplanen.dk API.
	 * Assumes date entry is intended as local Copenhagen time, regardless of device time zone setting
	 */
	public static getAPITime(date:Date) {
		return date.getHours() + ':' + (Number(date.getMinutes()) > 9 ? '' : '0') + date.getMinutes();
	}

	/** Parses date and time strings provided by Rejseplanen.dk API into valid Date instance.
	 * Expected formats are 'DD.MM.YY', 'HH:MM'.
	 */
	public static parseAPIDate(date: string, time: string): Date {
		// API times are in CET/CEST, i.e. including daylight saving ("summer time").
		// Daylight saving time adds 1 hour delta to UTC from March thru October.
		let d: Date = new Date( '20' + date.split('.')[2]  + '-' // YYYY
			+ date.split('.')[1] + '-' // MM
			+ date.split('.')[0] + 'T' // DD
			+ time + 'Z' // hh:mm;
		);
		// adjust for timezone offset, including daylight savings time
		let offset: number = d >= RejseplanenFactory._dstStart && d <= RejseplanenFactory._dstEnd ? 2 : 1;
		void d.setHours(d.getHours() - offset);
		return d;
	}

	/** Parses API message JSON into object conforming to Message interface */
	public static parseAPImessage(json: any) {
		let message: Message = {text: json.text};
		if (json.header) {message.header = json.header;}
		if (json.links) {message.links = json.links;}
		return message;
	}

	/** Parses API note JSON into object conforming to Note interface */
	public static parseAPInote(json: any) {
		let note: Note = {text: json.text};
		if (typeof json.routeIdxFrom !== undefined) {note.from = parseInt(json.routeIdxFrom);}
		if (typeof json.routeIdxTo !== undefined) {note.to = parseInt(json.routeIdxTo);}
		return note;
	}
}