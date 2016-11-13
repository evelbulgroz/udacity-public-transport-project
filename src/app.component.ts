'use strict';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router} from '@angular/router';
import { Title } from '@angular/platform-browser';

import {CacheWorker} from './offline/cache.worker.class';

import {htmlTemplate} from './app.component.html'; // include template in compiled bundle; external html may cause extra http request 
//import htmlTemplate: string from './journey-search.component.html'; // no need for ts literal when ts compiler catches up
import {styles} from './app.component.css'; // include template in compiled bundle; external html may cause extra http request 
//import styles: string from './app.component.html'; // no need for ts literal when ts compiler catches up

@Component({
  selector: 'public-transport-app',
  template: htmlTemplate,
  //templateUrl: 'app.component.html',
  styles: styles,
  //styleUrls: ['app.component.css'],
  viewProviders: [],
  providers: [Title]
})
export class AppComponent implements OnInit, OnDestroy {
  
  public isInChildView: boolean = false;
  public title: string = 'Public Transit App';
  public sub: any;
  
  public constructor(
    private cacheWorker: CacheWorker,
	private _route: ActivatedRoute,
    private _router: Router,
    private _titleService: Title) {      
    }
  
  /** Cleans up after component */
  public ngOnDestroy() {
    this.sub.unsubscribe();
  }
  
  /** Initializes component */
  public ngOnInit() {
    this.sub = this._router.events
      .subscribe((event: any) => { // set toolbar and document title as defined in route
        if (event instanceof NavigationEnd && this._route.outlet === PRIMARY_OUTLET) {
          let data: any = this._router.routerState.snapshot.root.firstChild.data;
          this.title = data.title;
          this.isInChildView = data.isChildView !== undefined && data.isChildView;
          this.setHTMLDocumentTitle(this.title + ' | Public Transit App');
        }
      });
  }

  public goBack() {
    void this._router.navigate(['../']);
  }
  
  /** Set html document title attribute */
  public setHTMLDocumentTitle(newTitle: string) {
    this._titleService.setTitle(newTitle);
  }

  /** Reloads page to update app (e.g. to activate new service worker) */
  public update(): void {
	  this.closeToast();
	  this.cacheWorker.update();
  }

  public closeToast() {
	  (<any>document.getElementById('cacheworker-update-toast')).close();
  }
}