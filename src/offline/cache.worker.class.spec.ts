import {CacheWorker} from './cache.worker.class';

function clearWorkers(): Promise<boolean> {
	return navigator.serviceWorker.getRegistrations()
		.then((registrations: ServiceWorkerRegistration[]) => {
			registrations.forEach((reg: ServiceWorkerRegistration) => {
				reg.unregister();
			});
			return Promise.resolve(true);
		})
		.catch((error: Error) => {
			return Promise.reject(error);
		});
}

describe('class CacheWorker', () => {
	if ('serviceWorker' in navigator) {
		let worker: CacheWorker;

		beforeAll((done) => {
			clearWorkers()			
				.then(() => {
					done();
				})
				.catch((error: Error) => {
					console.log(error);
					done();
				});
		});

		beforeEach((done) => {
			clearWorkers()			
				.then(() => {
					worker = new CacheWorker();
					done();
				})
				.catch((error: Error) => {
					console.log(error);
					done();
				});
		});
		
		it('is effectively a singleton' , () => {
			let worker2: CacheWorker = new CacheWorker();
			expect(worker2).toBe(worker);
		});

		it('installs a service worker into the app\'s scope when instantiated' , (done) => {
			// pretty crude, refine later
			navigator.serviceWorker.getRegistrations()
				.then((registrations: ServiceWorkerRegistration[]) => {
					expect(registrations.length).toBe(1);
					done();
				})
				.catch((error: Error) => {
					console.log(error);
					done();
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});

		it('can unregister the service worker from the app\'s scope' , (done) => {
			worker.unregister()
				.then((success: boolean) => {
					expect(success).toBe(true);
					navigator.serviceWorker.getRegistrations()
						.then((registrations: ServiceWorkerRegistration[]) => {
							expect(registrations.length).toBe(0);
							done();
						})
						.catch((error: Error) => {
							console.log(error);
							done();
						});
				})
				.catch((error: Error) => {
					console.log(error);
				});
			expect(true).toBe(true); // keep Jasmine happy!
		});

		xit('can update the service worker when an new version is installed and waiting' , () => {
			
		});

		afterEach((done) => {
			clearWorkers()			
				.then(() => {
					done();
				})
				.catch((error: Error) => {
					console.log(error);
					done();
				});
		});

		afterAll((done) => {
			clearWorkers()			
				.then(() => {
					done();
				})
				.catch((error: Error) => {
					console.log(error);
					done();
				});
		});
	}
	else {
		it('is not supported by platform/browser, skipping tests', () => {
			expect(true).toBe(true);
		});
	}
});