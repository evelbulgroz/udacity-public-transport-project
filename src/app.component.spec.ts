'use strict';

/*KNOWN BUG:
* Entire suite breaks on component creation. Return to this later.
*/

// test framework dependencies
import { ComponentFixture, TestBed } from '@angular/core/testing';
//import { By } from '@angular/platform-browser';
//import { DebugElement, EventEmitter } from '@angular/core';
//import { Component } from '@angular/core';

// app dependencies
import { ActivatedRoute, Router } from '@angular/router';
import {AppComponent} from './app.component';
import {AppModule} from './app.module';
import { Title } from '@angular/platform-browser';

// globals
let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;
//let el: DebugElement;
let titleService: Title;

describe('AppComponent', () => {
 beforeEach(() => {
    // create mocks
    class fakeTitleService {}
    class fakeRoute {}
	class fakeRouter {}
    
    // initialize test bed (pretty slow, optimize later)
    TestBed.configureTestingModule({
		//declarations: [AppComponent], // unnescessary when also importing AppModule
		imports: [
			AppModule // import CUSTOM_ELEMENTS_SCHEMA setting from AppModule,
			// along with the module's components
		],
		providers: [ // provide injected dependencies, fake (preferred) or real
			{provide: titleService, useValue: fakeTitleService},
			{provide: ActivatedRoute, useValue: fakeRoute},
			{provide: Router, useValue: fakeRouter}
		] 
	})
	.compileComponents();  // inline template and css

    // get references
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance; // AppComponent test instance  
    titleService = fixture.debugElement.injector.get(titleService);
    //el = fixture.debugElement.query(By.css('h1')); // get title DebugElement by element name
  });

  it('has a title that is "Public Transit App" by default', () => {
		console.log(comp);
		expect(comp.title).toBeDefined();
		expect(typeof comp.title).toBe('string');
		expect(comp.title).toBe('Public Transit App');
	});
});