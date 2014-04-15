angular.module('vido.element')

.directive('vidoFlashElement',
['$window', '$timeout', '$log', '$q', 'vido.utils',
function($window, $timeout, $log, $q, utils) {

	'use strict';

	return {

		restrict : 'AE',
		replace : true,
		templateUrl : 'partials/vidoFlashElement.html',
		link : function(scope, element, attrs) {

			var flashContext = element.children()[0];
			var swfAlias = swfobject;
			var flashMovie = null;
			var flashPromise = null;
			var shouldPlay = scope.meta.isPlaying;
			var shouldMute = scope.meta.isMuted;
			var prevTime = 0;
			var initialCue = null;


			scope.$watch('meta.seek', handleVideoSeek);
			scope.$watch('meta.isPlaying', handlePlayStateChange);
			scope.$watch('meta.isFullscreen', handleFullscreenChange);
			scope.$watch('meta.isMuted', handleVideoMuted);
			scope.$watch('meta.isHD', handleResolutionChange);
			scope.$watch('meta.poster', handlePosterImageChange);
			scope.$watch('meta.video', handleVideoChange);


			function getFlashMovie(movieName) {
			  	return swfAlias.getObjectById(movieName);
			}

			function create() {

	        	var flashvars = null,
					params = null,
					attributes = null,
					flashID = null,
					deferred = null;

				deferred = $q.defer();
				flashID = "FLASH:" + utils.uniqueId();

	            flashvars = {
	            	id : flashID,
					pauseImage : scope.meta.poster
				};
				
				attributes = {
					id : flashID,
					name : flashID
				};

				flashContext.id = flashID;

				params = {
					quality : "best",
					allowfullscreen : "true",
					allowscriptaccess : "always",
					wmode : "opaque"
				};

				assignFlashEvents(flashID, deferred);
	            
	            swfAlias.embedSWF("VideoElement.swf", flashID, "100%", "100%", "10.0.0", null, flashvars, params, attributes);

	            return deferred.promise;
	        }

	        function handleVideoSeek(newProgress) {
				
				if (scope.meta.isLoaded && newProgress && flashMovie) {
					flashMovie.videoSeek(newProgress);
				}
			}

			function handlePlayStateChange(isPlaying) {

				shouldPlay = isPlaying;
				
				if (scope.meta.isLoaded && flashMovie) {
					
					if (isPlaying) {
						scope.meta.isLoading = true;
						flashMovie.playVideo();
					}
					else {
						scope.meta.isLoading = false;
						flashMovie.pauseVideo();
					}
				}
			}

			function handleVideoMuted(isMuted) {
				
				if (scope.meta.isLoaded && flashMovie) {
					
					if (isMuted) {
						flashMovie.muteVideo();
					}
					else {
						flashMovie.unmuteVideo();
					}
				}
			}

			function handleResolutionChange(isHD) {

				var loadedVideo = null;

				if (scope.meta.isLoaded && flashMovie) {

					initialCue = scope.meta.progress;
					
					if (scope.meta.isHD) {
						loadedVideo = flashMovie.loadVideo(scope.meta.video.hi);
					}
					else {
						loadedVideo = flashMovie.loadVideo(scope.meta.video.low);
					}

					if (loadedVideo && loadedVideo !== 'false') {
						flashMovie.playVideo();
						scope.meta.isPlaying = true;
					}
					else {
						alert('ERROR: Unable to load video. Please try again.');
					}
				}
			}

			function handleVideoChange(newVideo) {

				if (scope.meta.isLoaded && newVideo && flashMovie) {
					loadNewVideo(newVideo);
				}
			}

			function loadNewVideo(newVideo) {

				var loadedVideo = null;

				scope.safeApply(function() {
					scope.meta.seek = 0;
					scope.meta.buffered = 0;
					scope.meta.progress = 0;
				});

				if (scope.meta.isHD) {
					loadedVideo = flashMovie.loadVideo(newVideo.hi);
				}
				else {
					loadedVideo = flashMovie.loadVideo(newVideo.low);
				}

				if (loadedVideo && loadedVideo !== 'false') {

					if (shouldPlay || scope.meta.isPlaying) {
						flashMovie.playVideo();
					}
				}
				else {
					alert('ERROR: Unable to load selected video. Please try again.');
				}
			}

			// FLASH UTILITY FUNCTIONS
			function assignFlashEvents(flashID, deferred) {

				$window["dynamicFunctionCall"] = function(fnName, data) {
					$window[fnName](data);
				};

				// FLASH VIDEO DISPLAY EVENTS
				$window[flashID + "FlashReady"] = function() {

					flashMovie = getFlashMovie(flashID);

					if (scope.meta.video && scope.meta.video.id) {
						loadNewVideo(scope.meta.video);
					}
					else if (scope.meta.video && typeof scope.meta.video.then === "function") {

						scope.meta.video.then(function(val) {
							loadNewVideo(val);
						});
					}
					
					deferred.resolve(flashMovie);
				};

				$window[flashID + "VideoStopped"] = function() {
				};

				$window[flashID + "ConnectionMade"] = function() {
				};

				$window[flashID + "VideoProgress"] = function(str) {
					
					var temp = str.split(",");
					var currentTime = parseFloat(temp[0]);
					var duration = parseFloat(temp[1]);
					var buffered = parseFloat(temp[2]);

					if (currentTime !== prevTime && !scope.$$phase) {

						scope.safeApply(function() {

							if (currentTime !== prevTime) {
								scope.meta.currentTime = utils.formatTime(currentTime);
								scope.meta.duration = utils.formatTime(duration);
								scope.meta.progress = currentTime/duration;
								scope.meta.isLoading = false;
							}

							scope.meta.buffered = (currentTime + buffered)/duration;
						});

						prevTime = currentTime;
					}
				};

				$window[flashID + "VideoLoading"] = function() {

					scope.safeApply(function() {
						scope.meta.isLoading = true;
					});
				};

				$window[flashID + "VideoLoaded"] = function() {

					if (initialCue) {
						flashMovie.videoSeek(initialCue);
						initialCue = null;
					}

					scope.meta.isLoading = false;
				};

				$window[flashID + "BufferFull"] = function() {
					$log.log('vidoFlashElement: BufferFull');
				};

				$window[flashID + "VideoPlaying"] = function() {
					$log.log('vidoFlashElement: VideoPlaying');
				};

				$window[flashID + "VideoPaused"] = function() {
					$log.log('vidoFlashElement: VideoPaused');
				};

				$window[flashID + "VideoError"] = function() {
					$log.log('vidoFlashElement: VideoError');
				};

				$window[flashID + "MetaData"] = function(str) {
					$log.log('vidoFlashElement: MetaData');
				};
			}

			$timeout(function() {
				flashPromise = create();
			}, 5);
		}
	};
}]);