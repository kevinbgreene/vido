angular.module('vido.playlist', [])

.directive('vidoPlaylistButton', ['$timeout', '$http', function($timeout, $http) {

	'use strict';

	return {

		restrict : 'AE',
		replace : true,
		templateUrl : 'partials/vidoPlaylistButton.html',
		link : function(scope, element, attrs) {}
	};

}])

.directive('vidoPlaylist', [function() {

	'use strict';

	return {

		restrict : 'AE',
		templateUrl : 'partials/vidoPlaylist.html',
		replace : true,
		link : function(scope, element, attrs) {

			scope.loadVideo = function(id, $event) {

				$event.stopPropagation();
				$event.preventDefault();

				scope.loadNewVideo(id);
				scope.meta.showPlaylist = false;
				scope.meta.isPlaying = true;
			}

			scope.$watch('meta.showPlaylist', function(isShowing) {
				
				if (isShowing) {
					scope.meta.isPlaying = false;
				}
			});

			scope.$watch('meta.isPlaying', function(isPlaying) {
				
				if (isPlaying) {
					scope.meta.showPlaylist = false;
				}
			});
		}
	};
}]);