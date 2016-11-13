'use strict';

// Various workarounds and other shared setup of the test environment

// Workaround for bugs in @angular/core/bundles/core-testing.umd.js
// source: https://github.com/angular/angular/issues/11317
import '../node_modules/zone.js/dist/long-stack-trace-zone.js';
import '../node_modules/zone.js/dist/async-test.js';
import '../node_modules/zone.js/dist/fake-async-test.js';
import '../node_modules/zone.js/dist/sync-test.js';
import '../node_modules/zone.js/dist/proxy.js';
import '../node_modules/zone.js/dist/jasmine-patch.js';
//import '../node_modules/reflect-metadata/Reflect';

// import test environment
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

//import {AppModule} from './app.module';

// initialize test environment (this should only be called once)
// source: http://stackoverflow.com/questions/39105854/how-to-fix-cannot-read-injector-property-of-null-bug-in-angular-2
TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

describe('test framework setup', () => {
	it('can get the test framework ready for running actual unit tests', () => {
		expect(true).toBe(true);
	});
});