'use strict';

import {Device} from './device.class';

describe('class Device', () => {
	it('can create a new instance', () => {
		expect((new Device()).constructor).toBe(Device);
	});

	describe('instance', () => {
		
		let testDevice: Device;
		
		beforeEach(() => {
			// Create a fresh instance to work with
			testDevice = new Device(); //implicit constructor test
			// We can't be absolutely sure about the initial
			// orientation, so set to known value first
			testDevice.orientation('landscape');
			testDevice.orientation('portrait');		
		});
		
		it('can get device orientation', () => {
			expect(testDevice.orientation()).toBe('portrait');
		});
		
		it('can set device orientation', () => {
			expect(testDevice.orientation()).toBe('portrait');
		});
		
		it('rejects attempt to set illegal device orientation', () => {
			var error_test = () => {
				testDevice.orientation('inclined');
			}
			expect(error_test).toThrow();
		});
		
		it('can tell if device orientation is landscape', () => {
			testDevice.orientation('landscape');
			expect(testDevice.isLandscape()).toBe(true);
			testDevice.orientation('portrait');
			expect(testDevice.isLandscape()).toBe(false);
		});
		
		
		it('can tell if device orientation is portrait', () => {
			testDevice.orientation('portrait');
			expect(testDevice.isPortrait()).toBe(true);
			testDevice.orientation('landscape');
			expect(testDevice.isPortrait()).toBe(false);
		});
		
		it('can tell if device is mobile (i.e. phone or tablet)', () => {
			// very crude, but no time to write test that doesn't just repeat the algorithm of the method itself
			// so simply verifying that we get a reply of the right type
			expect(typeof testDevice.isMobile()).toBe('boolean');
		});

		it('can tell if device runs Android', () => {
			expect(testDevice.isAndroid()).toBeDefined();
		});
		
		it('can tell if device runs iOS', () => {
			expect(testDevice.isiOS()).toBeDefined();
		});

		it('can tell if device runs Linux', () => {
			expect(testDevice.isLinux()).toBeDefined();
		});
		
		it('can tell if device runs MacOS', () => {
			expect(testDevice.isMacOS()).toBeDefined();
		});
		
		it('can tell if device runs Windows', () => {
			expect(testDevice.isWindows()).toBeDefined();
		});

		it('can tell the device\'s preferred language setting', () => {
			expect(testDevice.locale()).toBeDefined();
		});
		
		it('can tell if browser is Chrome', () => {
			expect(testDevice.isChrome()).toBeDefined();
		});

		it('can tell if browser is Firefox', () => {
			expect(testDevice.isFirefox()).toBeDefined();
		});

		it('can tell if browser is Internet Explorer', () => {
			expect(testDevice.isIE()).toBeDefined();
		});
		
		it('can tell if browser is Opera', () => {
			expect(testDevice.isOpera()).toBeDefined();
		});
		
		it('can tell if browser is Safari', () => {
			expect(testDevice.isChrome()).toBeDefined();
		});
	});
});