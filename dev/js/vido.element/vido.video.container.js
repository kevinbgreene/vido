angular.module('vido.element')

.directive('vidoVideoContainer', [function() {

	'use strict';

	return {

		restrict : 'AE',
		replace : true,
		templateUrl : 'partials/vidoVideoContainer.html',
		link : function(scope, element, attrs) {
		}
	};
}]);