angular.module('vido.element')

.directive('vidoHtmlElement',
['$log', '$timeout', '$document', 'vido.utils', 'vido.sniffer',
function($log, $timeout, $document, utils, sniffer) {

	'use strict';

	return {

		restrict : 'AE',
		replace : true,
		templateUrl : 'partials/vidoHtmlElement.html',
		link : function(scope, element, attrs) {

			var videoElement = null;
			var $videoElement = null;
			var image = null;
			var initialCue = null;
			var isAttached = false;


			scope.$watch('meta.seek', handleVideoSeek);
			scope.$watch('meta.isPlaying', handlePlayStateChange);
			scope.$watch('meta.isFullscreen', handleFullscreenChange);
			scope.$watch('meta.isMuted', handleVideoMuted);
			scope.$watch('meta.isHD', handleResolutionChange);
			scope.$watch('meta.poster', handlePosterImageChange);
			scope.$watch('meta.video', handleVideoChange);


			function prepareVideo() {

				// add event listeners
				videoElement.addEventListener('loadstart', handleLoadStart, false);
				videoElement.addEventListener('progress', handleVideoBuffering, false);
				videoElement.addEventListener('loadedmetadata', handleLoadedMetaData, false);
				videoElement.addEventListener('canplay', handleLoadedData, false);
				videoElement.addEventListener('waiting', handleVideoWaiting, false);
				videoElement.addEventListener('stalled', handleVideoStalled, false);
				videoElement.addEventListener('timeupdate', handleTimeUpdate, false);
				videoElement.addEventListener('ended', handleVideoEnded, false);
				videoElement.addEventListener('playing', handleVideoPlaying, false);
				videoElement.addEventListener('error', handleVideoError, false);

				if (sniffer.iphone) {
					videoElement.addEventListener('webkitendfullscreen', htmlVideoEndsFullScreen, false);
				}
			};

			function setTime(requestedTime) {

				try {
					videoElement.currentTime = requestedTime;
				}
				catch(err) {

					if (videoElement !== null) {
						videoElement.currentTime = 0;
					}
				}
			}

			function play() {

				try {

					if (!isAttached) {
						
						$(videoElement).css({
							position : 'absolute',
							top: -10000,
							left: -10000
						});

						element.append(videoElement);
						isAttached = true;
					}
					
					if (sniffer.iphone) {
						videoElement.load();
					}

					videoElement.play();

					scope.safeApply(function() {
						scope.meta.isPlaying = true;
						scope.meta.isLoading = true;
					});
				}
				catch(e) {
					
					scope.safeApply(function() {
						scope.meta.isPlaying = false;
						scope.meta.isLoading = false;
					});
				}
			}

			function loadPlaceholder() {

				if (image) {
					$(image).remove();
					image = null;
				}

				image = new Image();
				image.src = scope.meta.poster;
				image.className = 'vido-video-placeholder';
				element.prepend(image);
			}

			function stopVideo() {

				videoElement.pause();

				scope.safeApply(function() {
					scope.meta.isPlaying = false;
					scope.meta.isLoading = false;
				});
			}

			function handleLoadStart(evt) {

				scope.safeApply(function() {
					scope.meta.isLoaded = true;
				});
			}

			function handleLoadedData(evt) {

				var currentTime = videoElement.currentTime || 0;
				var duration = videoElement.duration || 0;

				if (initialCue) {
					setTime(initialCue);
					initialCue = null;
				}

				if (scope.meta.isPlaying) {
					play();
				}

				scope.safeApply(function() {
					scope.meta.currentTime = utils.formatTime(currentTime);
					scope.meta.duration = utils.formatTime(duration);
				});
			}

			function handleVideoBuffering(evt) {

				if (!isNaN(videoElement.duration) && videoElement.duration > 0) {

					var duration = videoElement.duration;
					var buffered = videoElement.buffered.length > 0 ? videoElement.buffered.end(0) : 0;

					scope.safeApply(function() {
						scope.meta.buffered = buffered/duration;
					});
				}
			}

			function handleTimeUpdate(evt) {

				var currentTime = videoElement.currentTime || 0;
				var duration = videoElement.duration || 0;

				scope.safeApply(function() {
					scope.meta.currentTime = utils.formatTime(currentTime);
					scope.meta.duration = utils.formatTime(duration);
					scope.meta.progress = currentTime/duration;
					scope.meta.isLoading = false;
				});
			};

			function handleVideoEnded(evt) {

				var duration = videoElement.duration || 0;

				scope.safeApply(function() {
					scope.meta.hasEnded = true;
					scope.meta.isPlaying = false;
					scope.meta.isLoading = false;
					scope.meta.seek = 0;
					scope.meta.buffered = 0;
				});
			};

			function handleVideoError(evt) {

				evt.preventDefault();
				evt.stopPropagation();

				switch (evt.target.error.code) {

     				case evt.target.error.MEDIA_ERR_ABORTED:
       					$log.log('You aborted the video playback.');
       					break;
     
     				case evt.target.error.MEDIA_ERR_NETWORK:
       					$log.log('A network error caused the video download to fail part-way.');
       					break;
     		
     				case evt.target.error.MEDIA_ERR_DECODE:
       					$log.log('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.');
       					break;
     				
     				case evt.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
       					$log.log('The video could not be loaded, either because the server or network failed or because the format is not supported.');
       					break;
     
     				default:
       					$log.log('An unknown error occurred.');
       					break;

       			}

				scope.safeApply(function() {
					scope.meta.isPlaying = false;
				});
			}

			function handleVideoPlaying() {

				scope.safeApply(function() {
					scope.meta.isLoading = false;
					scope.meta.isPlaying = true;
				});
			}

			function handleVideoStalled(evt) {

				evt.preventDefault();
				evt.stopPropagation();

				scope.safeApply(function() {
					scope.meta.isLoading = true;
				});
			}

			function handleVideoWaiting(evt) {

				evt.preventDefault();
				evt.stopPropagation();

				scope.safeApply(function() {
					scope.meta.isLoading = true;
				});
			}

			function handleLoadedMetaData(evt) {

				scope.meta.isLoaded = true;
			};

			function htmlVideoEndsFullScreen(evt) {
				stopVideo();
			}

			function handleVideoSeek(newProgress, oldProgress) {

				if (videoElement !== null && scope.meta.isLoaded && newProgress) {

					var duration = videoElement.duration || 0;

					setTime(newProgress * duration);
				}
			}

			function handlePlayStateChange(isPlaying) {

				if (videoElement !== null && scope.meta.isLoaded) {
					
					if (isPlaying) {

						play();
					}
					else {
						videoElement.pause();
					}
				}
			}

			function handleFullscreenChange(isFullscreen) {

				if (videoElement !== null && scope.meta.isLoaded) {
					
					if (isFullscreen) {

						try {
		        		
				    		if (document.documentElement.requestFullScreen) {
						      	document.documentElement.requestFullScreen();
						    }
						    else if (document.documentElement.mozRequestFullScreen) {
						      	document.documentElement.mozRequestFullScreen();
						    }
						    else if (document.documentElement.webkitRequestFullScreen) {
						      	document.documentElement.webkitRequestFullScreen();
						    }
						    else if (videoElement.webkitSupportsFullscreen) {
								videoElement.webkitEnterFullScreen();
						    }
				    	}
				    	catch (e) {}
					}
					else {

						if (document.webkitIsFullScreen || document.mozFullScreen) {
		    	
				        	if (document.cancelFullScreen) {
						    	document.cancelFullScreen();
						    }
						    else if (document.mozCancelFullScreen) {
						      	document.mozCancelFullScreen();
						    }
						    else if (document.webkitCancelFullScreen) {
						      	document.webkitCancelFullScreen();
						    }
				        }
					}
				}
			}

			function handleVideoMuted(isMuted) {

				if (videoElement !== null && scope.meta.isLoaded) {
					
					if (isMuted) {
						videoElement.volume = 0
					}
					else {
						videoElement.volume = scope.meta.volume;
					}
				}
			}

			function handleResolutionChange(isHD) {

				if (videoElement !== null && scope.meta.isLoaded) {

					initialCue = videoElement.currentTime;

					if (!videoElement.paused) {
						videoElement.pause();
					}
					
					if (scope.meta.isHD) {
						videoElement.src = scope.meta.video.hi;
					}
					else {
						videoElement.src = scope.meta.video.low;
					}

					videoElement.load();
					play();
				}	
			}

			function handlePosterImageChange(newPoster, oldPoster) {

				if (newPoster) {

					if (sniffer.iphone && image) {
						loadPlaceholder();
					}
					else if (!sniffer.iphone && videoElement !== null) {
						videoElement.poster = newPoster;
					}
				}
			}

			function handleVideoChange(newVideo, oldVideo) {

				if (newVideo && newVideo !== oldVideo || newVideo && videoElement === null) {

					var newSource = null;

					scope.safeApply(function() {
						scope.meta.seek = 0;
						scope.meta.buffered = 0;
						scope.meta.progress = 0;
						scope.meta.isLoaded = false;
						initialCue = 0;
					});

					if (scope.meta.isHD) {
						newSource = newVideo.hi;
					}
					else {
						newSource = newVideo.low;
					}

					if (!videoElement) {

						videoElement = $document[0].createElement('video');
						$videoElement = $(videoElement);
						prepareVideo();

						if (sniffer.iphone) {
							loadPlaceholder();
							videoElement.src = scope.meta.video.path + scope.meta.video.low;
						}
						else {

							videoElement.src = newSource;
							videoElement.poster = scope.meta.poster;
							videoElement.preload = 'auto';

							element.prepend(videoElement);
							isAttached = true;
							videoElement.load();
						}
					}
					else {

						if (!videoElement.paused) {
							videoElement.pause();
						}

						if (sniffer.iphone && image !== null) {
							videoElement.src = scope.meta.video.path + scope.meta.video.low;
						}
						else {
							videoElement.src = newSource;
							videoElement.load();
						}
					}

					if (scope.meta.isPlaying) {
						play();
					}
				}
			}
		}
	};
}]);