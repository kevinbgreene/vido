angular.module('vido', [
	'ngAnimate',
	'vido.player',
	'vido.element',
	'vido.controller',
	'vido.playlist',
	'vido.services',
	'vido.utils'
])

.config(['$locationProvider', function($locationProvider) {

	'use strict';

	$locationProvider.html5Mode(false);

}])

.run([function() {

	'use strict';

}]);