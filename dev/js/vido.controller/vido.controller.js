angular.module('vido.controller', [])

.directive('vidoController', [function() {

	'use strict';

	return {

		restrict: 'AE',
		templateUrl : 'partials/vidoController.html',
		replace : true,
		link : function(scope, element, attrs) {}
	};

}])

.directive('vidoProgressBar',
['$log', '$document', '$timeout',
function($log, $document, $timeout) {

	'use strict';

	return {

		restrict : 'AE',
		replace : true,
		templateUrl : 'partials/vidoProgressBar.html',
		link : function(scope, element, attrs) {

			var $buffer = angular.element(element.children()[1]);
			var $fill = angular.element(element.children()[2]);
			var $indicator = angular.element(element.children()[3]);

			var progressWidth = element.width();
			var progressPromise = null;

			var isDragging = false;

			scope.$watch('meta.buffered', handleVideoBuffered);
			scope.$watch('meta.progress', handleVideoProgress);
			scope.$watch('windowWidth', handleWindowResize);

			element.on('mousedown', function(evt) {
				
				evt.stopPropagation();
				evt.preventDefault();

				isDragging = true;
				
				scope.$apply(function() {
					scope.meta.isDragging = true;
				});
				
				updateProgress(evt);
			});

			$document.on('mouseup', function(evt) {
				isDragging = false;
			});

			$document.on('mousemove', function(evt) {
	
				if (isDragging) {
					updateProgress(evt);
				}
			});

			function handleVideoBuffered(newProgress) {
				
				if (scope.meta.isLoaded) {

					var newWidth = newProgress * progressWidth;

					$buffer.css({
						width: newWidth + 'px'
					});
				}
			}

			function handleVideoProgress(newProgress) {
				
				if (scope.meta.isLoaded && !scope.meta.isDragging) {

					var newWidth = newProgress * progressWidth;

					$fill.css({
						width: newWidth + 'px'
					});

					$indicator.css({
						left: newWidth + 'px'
					});
				}
			}

			function handleWindowResize(newWidth) {
				progressWidth = element.width();
			}

			function updateProgress(evt) {

				var x = evt.offsetX;
 				if (x == undefined) {
     				x = evt.clientX - $(evt.target).offset().left;
     			}

     			$fill.css({
     				width: x + 'px'
     			});

     			$indicator.css({
     				left: x + 'px'
     			});

     			if (progressPromise) {
     				$timeout.cancel(progressPromise);
     				progressPromise = null;
     			}

     			progressPromise = $timeout(function() {

     				scope.safeApply(function() {
						scope.meta.seek = x/progressWidth;
						scope.meta.isDragging = false;
					});

     			}, 300);
			}
		}
	};
}]);