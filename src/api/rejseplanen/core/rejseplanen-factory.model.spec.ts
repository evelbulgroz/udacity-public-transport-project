'use strict';

import {Message} from './../../../core/message.interface';
import {Note} from './../../../core/note.interface';
import {RejseplanenFactory} from './rejseplanen-factory.model';

describe('model RejseplanenFactory', () => {
	let testFactory: RejseplanenFactory;
	
	beforeEach(() => {
		testFactory = new RejseplanenFactory();
	});

	it('provides a createProduct function', () => {
		expect(testFactory.createProduct).toBeDefined();
		expect(typeof testFactory.createProduct).toBe('function');
	});

	it('provides a register product function', () => {
		expect(testFactory.registerProduct).toBeDefined();
		expect(typeof testFactory.registerProduct).toBe('function');
	});

	it('can convert a JavaScript Date into an API date string', () => {
		let testDate: Date = new Date("2016-07-26T07:00:01.000Z");
		expect(RejseplanenFactory.getAPIDate(testDate)).toBe('26.7.16');
	});

	it('can convert a JavaScript Date into an API time string', () => {
		let testDate: Date = new Date("2016-07-26T07:04:00.000Z");
		expect(RejseplanenFactory.getAPITime(testDate)).toBe('9:04');
	});

	it('can parse an API date string into a valid JavaScript Date', () => {
		let testDate: Date = RejseplanenFactory.parseAPIDate('19.07.16', '07:02');
		expect(testDate.toISOString()).toBe('2016-07-19T05:02:00.000Z');
	});

	it('can parse API message json into a valid Message', () => {
		let testMessage: Message = RejseplanenFactory.parseAPImessage({text: 'message text', header: 'message header', links: ['url1', 'url2']});
		expect(testMessage.text).toBe('message text');
		expect(testMessage.header).toBe('message header');
		expect(testMessage.links.length).toBe(2);
		expect(testMessage.links[0]).toBe('url1');
	});

	it('can parse API note json into a valid Note', () => {
		let testNote: Note = RejseplanenFactory.parseAPInote({text: 'note text', routeIdxFrom: 0, routeIdxTo: 3});
		expect(testNote.text).toBe('note text');
		expect(testNote.from).toBe(0);
		expect(testNote.to).toBe(3);
	});

	it('can get the prefix used for naming API variants of core entities', () => {
		expect(RejseplanenFactory.getAPIPrefix()).toBe('Rejseplanen');
	});
	
	afterEach(() => {
		testFactory = undefined;
	});
});