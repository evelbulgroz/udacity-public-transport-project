'use strict';

// source: http://output.jsbin.com/qofuwa/2/quiet

// blocks pull-to-refresh gesture in Chrome Android 
window.addEventListener('load', function() {
	var maybePreventPullToRefresh = false;
	var lastTouchY = 0;

	document.addEventListener('touchstart', function(e) {
		if (e.touches.length != 1) return;
		lastTouchY = e.touches[0].clientY;
		// Pull-to-refresh will only trigger if the scroll begins when the
		// document's Y offset is zero.
		maybePreventPullToRefresh = window.pageYOffset === 0;
	},
	false);

	document.addEventListener('touchmove', function(e) {
		var touchY = e.touches[0].clientY;
		var touchYDelta = touchY - lastTouchY;
		lastTouchY = touchY;
		if (maybePreventPullToRefresh) {
			// To suppress pull-to-refresh it is sufficient to preventDefault the  first overscrolling touchmove.
			maybePreventPullToRefresh = false;
			if (touchYDelta > 0) {
				e.preventDefault();
				return;
			}
		}
	},
	false);
});