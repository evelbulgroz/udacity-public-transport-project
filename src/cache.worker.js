'use strict';

// Service worker handling offline caching of static app resources.
// Inspirations:
// - 'wittr' example provided in Udacity Sr. Frontend Developer course,
// - https://github.com/GoogleChrome/samples/blob/gh-pages/service-worker/selective-caching/service-worker.js
// - https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

const CACHE_VERSION = 0;
const CACHES = {
  static: 'dk.ulrikgade.sr.webdev.public.transport.app.v' + CACHE_VERSION
};

/** Clears caches in app's scope when activating a new/updated service worker
 * 
 */
self.addEventListener('activate', function(event) {
	//console.log('activating service worker ');
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter(function(cacheName) {
					return cacheName.startsWith(CACHES.static);
				})
					.map(function(cacheName) {
						var version = parseInt(cacheName.split('.').pop().split('v').pop());
						if (version < CACHE_VERSION) {
							return caches.delete(cacheName);
						}
					})
			);
		})
	);
});

/** Intercepts http requests, serves static assets from cache, or fetches assets and adds them to cache.
 * All other requests are passed through unaffected.
 */  

self.addEventListener('fetch', function(event) {
	function _addToCache(cache, response) {
		if (response.url.split('/').pop() !== 'cache.worker.js') {
			// don't cache service worker itself
			var extension =  response.url.split('.').pop().toLowerCase();
			if (['css', 'gif', 'html', 'jpg', 'js', 'png'].indexOf(extension) > -1) {
				// otherwise, basically hoover up any and all basic static app assets and put into cache 
				void cache.put(response.url, response.clone());
			}
		}
	}

	var request = event.request;
	caches.open(CACHES.static)
		.then(function(cache) {
			return cache.match(request)
				.then(function(response) { // use item in cache, if available
					if (response) {
						return response;
					}
					else {
						fetch(request)
							.then(function(response) { // else fetch and add to cache
								_addToCache(cache, response)
								return response;
							});
					}
				})
		})
});

/** Receives and responds to messages from service worker context */
self.addEventListener('message', function(event) {
	if (event.data.action === 'skipWaiting') { // install waiting service worker
		self.skipWaiting();
	}
});

/** Creates and initially populates app cache(s) */
self.addEventListener('install', function(event) { //ExtendableEvent
	//console.log('installing service worker');
	try {
		event.waitUntil(
			caches.open(CACHES.static)
				.then(function(cache) {
					return cache.addAll([
						'main.js',
						'lib.js',
						'app.css',
						'elements.html',
						'index.html',
						//'images/api-rejseplanen-agency-dsb.png',
						//'images/api-rejseplanen-agency-metro.png',
						//'images/api-rejseplanen-agency-stog.png',
						'images/api-rejseplanen-bus.png',
						'images/api-rejseplanen-ferry.png',
						'images/api-rejseplanen-logo.png',
						'images/api-rejseplanen-logotype.gif',
						'images/api-rejseplanen-map.png',
						'images/api-rejseplanen-route-a.png',
						'images/api-rejseplanen-route-b.png',
						'images/api-rejseplanen-route-bx.png',
						'images/api-rejseplanen-route-c.png',
						'images/api-rejseplanen-route-e.png',
						'images/api-rejseplanen-route-f.png',
						'images/api-rejseplanen-route-h.png',
						'images/api-rejseplanen-route-ic.png',
						'images/api-rejseplanen-route-icl.png',
						'images/api-rejseplanen-route-m1.png',
						'images/api-rejseplanen-route-m2.png',
						'images/api-rejseplanen-route-m3.png',
						'images/api-rejseplanen-route-re.png',
						'images/api-rejseplanen-route-tog.png',
						'images/error.png',
						'images/favicon.png',
						'images/logo-inverse.png',
						'images/logo.png',
						'images/spinner.gif',
						'images/ulrik.jpg',
						'images/walk.png'
					])
					.catch(function(error) {
						void error; // ignore error re. build files during development
					});
				})
		);
	}
	catch(error) {
		console.log(error);
	}	
});