angular.module('vido.element')

.directive('vidoLoading', ['$timeout', function($timeout) {

	'use strict';

	return {

		restrict: 'AE',
		templateUrl : 'partials/vidoLoading.html',
		replace : true,
		link : function(scope, element, attrs) {

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