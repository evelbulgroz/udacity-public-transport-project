'use strict';

import { Injectable } from '@angular/core';

import {preferences} from './../app.module';

/**@classdesc Convenience class for initializing and updating caching service worker.
 * Inwardly implemented as singleton to avoid dealing with multiple initializations of same service worker.
 * But intended for use with Angular2's dependency injector, which requires a public constructor.
 * So a constructor is provided, which simply returns the same instance if invoked repeatedly. 
 */
@Injectable()
export class CacheWorker {
	private static _instance: CacheWorker;
	private _readi: boolean = false;
	private _registratn: ServiceWorkerRegistration;

	/** Returns singleton instance of class */
	public constructor() {
		return this._getInstance();
	}

	// Gets and, if necessary, initializes singleton instance of class
	private _getInstance(): CacheWorker {
		if (CacheWorker._instance) {
			return CacheWorker._instance;
		}
		else {
			if ('serviceWorker' in navigator) {
				// set up service worker
				navigator.serviceWorker.register(preferences.cacheWorkerUrl, {scope: './'})
					.then((reg: ServiceWorkerRegistration) => { // registration worked
						this._readi = true;
						this._registratn = reg;

						// reload on controllerchange event (does not seem to receive event)
						(<any>navigator.serviceWorker).addEventListener('controllerchange', () => {
							console.log('controllerchange');
							window.location.reload();
						});

						if (reg.waiting) {
							this._showUpdateNotification('waiting');
						}

						if (reg.installing) {
							reg.installing.addEventListener('statechange', (event: Event) => {
								if((<any>event).currentTarget.state === 'installed') {
									window.setTimeout(() => {
										if (reg.waiting) { // skip notification on first load of sw
											this._showUpdateNotification('installed');
										}
									}, 10);
								}
							});
						}
					})
					.catch((error: Error) => {
						console.log('CacheWorker registration failed with ' + error);
					});
			}
			CacheWorker._instance = this;
			return this;
		}
	}

	// Determines whether service worker initialization has completed
	private _ready(): Promise<boolean> {
		return new Promise((resolve: Function, reject: Function) => {
			let i: number = 0;
			let id: number = window.setInterval(() => {
				if (this._registratn && this._readi) {
					clearInterval(id);
					resolve(true);
				}
				else if (i > 99) {
					clearInterval(id);
					reject('Cacheworker not ready, aborting');
				}
				else {
					i++;
				}
			}, 10);
		});
	}

	// Gets the sw registration that was created when instantiating CacheWorker
	private _registration(): Promise<ServiceWorkerRegistration> {
		return this._ready()
			.then(() => {
				return Promise.resolve(this._registratn);
			})
			.catch((error: Error) => {
				return Promise.reject(error);
			});
	}

	// shows notification (toast) asking whether to install update and reload
	 // expects html, and primary event handlers to be defined in an Angular2 component
	private _showUpdateNotification(state?: string) {
		console.log(state);
		let toast: any = document.getElementById('cacheworker-update-toast');
		if (toast) {
			toast.show({duration: 10000});
		}
	}

	/** Unregisters service workers in app's scope
	 * Mostly for use in cleaning up after unit testing
	 */
	public unregister(): Promise<boolean> {
		if ('serviceWorker' in navigator) {
			return this._registration() // first calls ready(), so no need here  
				.then((reg: ServiceWorkerRegistration) => {
					return reg.unregister()
						.then((success: boolean) => {
							return success;
						});
				})
				.catch((error: Error) => {
					Promise.reject(error);
				});
		}
		else {
			return Promise.resolve(true);
		}
	}

	/** Activates updated version of service worker, if available */
	public update(): void {
		if ('serviceWorker' in navigator) {
		this._registration() // first calls ready(), so no need here  
			.then((reg: ServiceWorkerRegistration) => {
				if (reg && reg.waiting) {
					reg.waiting.postMessage({action: 'skipWaiting'});
					window.location.reload(); // controllerchange handler doesn't get triggered, so reload manually
				}
			})
			.catch((error: Error) => {
				console.log(error);
			});
		}
	}
}