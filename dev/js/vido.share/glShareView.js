angular.module('vido.player')

.directive('glShareView', ['$timeout', function($timeout) {

	'use strict';

	return {

		restrict : 'AE',
		templateUrl : 'partials/glShareView.html',
		replace : true,
		link : function(scope, element, attrs) {

			scope.width = 640;
			scope.height = 360;
			scope.shareUrl = scope.meta.url + "?id=" + scope.meta.video.id;
			scope.embedCode = updateEmbedCode();

			scope.$watch('meta.url', function(newUrl) {

				if (scope.isLoaded && newUrl) {
					scope.shareUrl = newUrl + "?id=" + scope.meta.video.id;	
				}
			});

			scope.$watch('meta.video', function(newVideo) {

				if (scope.isLoaded && newVideo) {
					scope.shareUrl = scope.meta.url + "?id=" + newVideo.id;	
				}
			});

			scope.$watch('width', function(newWidth) {

				if (scope.isLoaded && newWidth) {
					scope.embedCode = updateEmbedCode();
				}
			});

			scope.$watch('height', function(newHeight) {

				if (scope.isLoaded && newHeight) {
					scope.embedCode = updateEmbedCode();
				}
			});

			function updateEmbedCode() {

				return "<iframe src='http://www.glidewelldental.com/apps/VideoPlayer/embed.aspx?id=" + scope.meta.video.id + "' scrolling='no' frameborder='0' style='border:none; overflow:hidden; width:" + scope.width + "px; height:" + scope.height + "px;' align='top' allowTransparency='true' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>";
			}

			function resetDisplay() {
				element.css({
					display : ''
				});
			}

			if (scope.meta.isLoading) {
				resetDisplay();
			}
			else {
				$timeout(resetDisplay, 300);
			}
		}
	};
}]);