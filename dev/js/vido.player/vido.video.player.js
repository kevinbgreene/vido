angular.module('vido.player')

.directive('vidoVideoPlayer',
['$log', '$rootScope', '$window', '$document', '$timeout', 'videoStore', 'vido.utils', 'vido.sniffer',
function($log, $rootScope, $window, $document, $timeout, videoStore, utils, sniffer) {

	'use strict';

	var directive = {

		restrict : 'AE',
		replace : true,
		scope : {},
		templateUrl : 'partials/vidoVideoPlayer.html',

		link : function(scope, element, attrs) {

			var supportsVideo = utils.supportsVideo();
			var supportsFullscreen = utils.supportsFullscreen();
			var playlist_id = utils.queryVariable('playlist') || null;
			var id = utils.queryVariable('id') || null;
			var poster = utils.queryVariable('poster') || 'assets/pause.jpg';
			var showPromise = null;
			var isTouch = sniffer.touch;

			// meta data shared by all child scopes
			scope.meta = {

				video              : {},
				playlist           : [],

				volume             : 0.5,
				poster             : poster,
				playlist_id        : playlist_id,
				id                 : id,
				
				seek               : 0,
				progress           : 0,
				buffered           : 0,
				duration           : '00:00',
				currentTime        : '00:00',

				// playlist
				activeIndex        : 0,

				// booleans
				showButton         : true,
				isLoaded           : true,
				isLoading          : false,
				isPlaying          : false,
				isTouch            : isTouch,
				isFullscreen       : false,
				supportsFullscreen : supportsFullscreen,
				isMuted            : false,
				isDragging         : false,
				hasPlaylist        : !!playlist_id,
				showPlaylist       : false,
				showController     : false,
				isFlash            : !!supportsVideo ? false : true,
				isHD               : false,
				shouldShare        : false
			};

			scope.showController = function() {

				scope.meta.showController = true;

				if (showPromise) {
					$timeout.cancel(showPromise);
					showPromise = null;
				}

				showPromise = $timeout(function() {
					scope.meta.showController = false;
					showPromise = null;
				}, 3000);
			};

			scope.broadcast = function(event, parameters) {
				$rootScope.$broadcast(event, parameters);
			};

			scope.safeApply = function(fn) {
  				
  				var phase = this.$root.$$phase;
  				
  				if (phase == '$apply' || phase == '$digest') {
    			
    				if (fn && (typeof(fn) === 'function')) {
      					fn();
    				}
  				}
  				else {
    				this.$apply(fn);
  				}
			};

			scope.loadNewVideo = function(id) {

				if (sniffer.touch) {

					scope.safeApply(function() {
						scope.meta.isPlaying = false;
					});
				}
				else {
					scope.meta.isPlaying = true;
				}

				videoStore.getById(id).then(function(obj) {

					scope.safeApply(function() {
						scope.meta.video = obj.video;
						scope.meta.activeIndex = obj.index;
					});
				});
			};

			if (scope.meta.playlist_id) {
 				
 				videoStore.getPlaylist(scope.meta.playlist_id).then(function(playlist) {
 					
 					scope.meta.playlist = playlist;

 					videoStore.getById(id).then(function(obj) {
						scope.meta.video = obj.video;
						scope.meta.activeIndex = obj.index;
					});
 				});
 			}
 			else {
 				videoStore.getById(scope.meta.id).then(function(obj) {
 					scope.meta.video = obj.video;
 					scope.meta.activeIndex = obj.index;
 				});
 			}

 			function onFullscreenChange(evt) {

 				var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

 				var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

 				scope.$apply(function() {

 					if (!fullscreenEnabled || !fullscreenElement) {
 						scope.meta.isFullscreen = false;
 					}
 					else {
 						scope.meta.isFullscreen = true;
 					}
 				});
 			}

 			// DOCUMENT EVENTS
 			$document.on('fullscreenchange', onFullscreenChange);      
		   	$document.on('webkitfullscreenchange', onFullscreenChange);
		   	$document.on('mozfullscreenchange', onFullscreenChange);

		   	// WINDOW EVENTS
 			scope.windowWidth = $window.outerWidth;
 			angular.element($window).on('resize',function(){

 				scope.$apply(function() {
 					scope.windowWidth = $window.outerWidth;
 				});
 			});

			$window['resetVideoPlayer'] = function() {}

			$window['pauseVideoPlayer'] = function() {

				scope.safeApply(function() {
					scope.meta.isPlaying = false;
				});
			};

			$window['playVideoForID'] = function(id) {

				scope.safeApply(function() {
					scope.loadNewVideo(id);
				});
			};

			$window['updatePosterImage'] = function(img) {

				scope.safeApply(function() {
					scope.meta.isPlaying = false;
					scope.meta.poster = img;
				});
			};
		}
	};

	return directive;
}]);