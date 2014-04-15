angular.module('vido.element')

.directive('vidoVideoElement', [function() {

	'use strict';

	return {

		restrict : 'AE',
		replace : true,
		templateUrl : 'partials/vidoVideoElement.html',
		link : function(scope, element, attrs) {}
	};
}]);