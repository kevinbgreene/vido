angular.module('vido.utils', [])

.directive('move', function() {

	'use strict';

	return function(scope, element, attrs) {
		
		element.on('mousemove', function() {
			scope.$apply(attrs.move);
		});
	};
})

.directive('enter', function() {

	'use strict';

	return function(scope, element, attrs) {

		element.mouseenter(function() {
			scope.$apply(attrs.enter);
		});
	};
})

.directive('leave', function() {

	'use strict';

	return function(scope, element, attrs) {
		
		element.mouseleave(function() {
			scope.$apply(attrs.leave);
		});
	};
})

.factory("vido.settings", [function () {

	'use strict';

	var settings = {};
	var dataKey = "VIDO_SETTINGS";
    var settingsObj = null;

    settingsObj = loadSettings() || {};

    function loadSettings() {
        var temp = JSON.parse(Utils.getData(dataKey));
        return temp;
    }

    settings = {

        get : function(key) {
            var tempSetting = settingsObj[key] || null;
            return tempSetting;
        },

        save : function(key, value) {
            settingsObj[key] = value;
            Utils.setData(dataKey, JSON.stringify(settingsObj), 365);
            return settingsObj[key];
        }
    };

    return settings;

}])

.factory('vido.config', function() {

	'use strict';

	var store = {};

	var service = {

		get : function(key) {
			return store[key] || null;
		},

		set : function(key, value) {
			store[key] = value;
			return this;
		}
	};

	return service;

})

.factory('vido.sniffer', ['$document', '$window', '$q', function($document, $window, $q) {

	'use strict';

	var vendorPrefixes = ['Webkit', 'Moz', 'ms', 'Ms'];

	var service = {
		pixelDensity : 1,
        fullscreen : false,
        inApplicationMode : null,
        isTouchDevice : false,
        isHighRes : false,
        transitionEndEvent : null,
        allowsFullscreen : false,
        isIPhone : false
	};

	function init() {

        if ($window.navigator.standalone) {
            service.standalone = true;
        }

        var ua = navigator.userAgent;
	    var temp = ~ua.indexOf('iPhone') || ~ua.indexOf('iPod') || false;

	    if (temp) {
	        service.iphone = true;
	    }

	    temp = null;
	    ua = null;

        service.touch = (function() {
            return ('ontouchstart' in $document[0].documentElement);
        }());

        service.pushState = !!($window.history && $window.history.pushState);

        service.transition = !!cssSupports('transition') && !!cssSupports('transform');

        if ($window.devicePixelRatio !== undefined) {
            service.pixelDensity = $window.devicePixelRatio;
        }

        if (screen.width >= 1200 || service.pixelDensity >= 1.5) {
            service.highRes = true;
        }

        if (typeof $document[0].documentElement.webkitRequestFullScreen != 'undefined' 
            || typeof $document[0].documentElement.mozRequestFullScreen != 'undefined'
            || typeof $document[0].documentElement.requestFullScreen != 'undefined') {
            service.fullscreen = true;
        }
    }

    function cssSupports(property) {

        var div = $document[0].createElement('div'),
            len = vendorPrefixes.length,
            adjustedProperty = '';
              
        if (property in div.style) {
            div = null;
            return {
                prop : property,
                vendor : 'default',
                combined : property
            };
        }

        adjustedProperty = property.replace(/^[a-z]/, function(val) {
            return val.toUpperCase();
        });

        while (len--) {

            if (vendorPrefixes[len] + adjustedProperty in div.style) {
                div = null;
                return {
                    prop : property,
                    vendor : vendorPrefixes[len],
                    combined : vendorPrefixes[len] + adjustedProperty
                };
            }
        }
        
        div = null;
        return false;
    }

    service.css = cssSupports;

    init();

    return service;
}])

.factory('vido.storage', [function() {

	'use strict';

	var service = {};

	service.setData = function(name, value) {

		var localStorage = $window['localStorage'] || null;

        if (localStorage) {
            localStorage[name] = value;
        }
    };

    service.getData = function(name) {

    	var localStorage = $window['localStorage'] || null;
        
        if (localStorage && localStorage[name]) {

            return localStorage[name];
        }
        else {
            return null;
        }
    };

    return service;
}])

.factory("vido.utils", ["$window", "$document", "$rootScope", "$q", '$location',
function ($window, $document, $rootScope, $q, $location) {

	'use strict';

	var factory = {};
	var ids = [];

    factory.queryVariable = function(variable) {
                
        var query = $window.location.search.substring(1);
        var vars = query.split("&");
        var i = 0;
        var len = vars.length;
        
        for (var i = 0; i < len; i++) {

            var pair = vars[i].split("=");

            if (pair[0] == variable) {
                return decodeURIComponent(pair[1]);
            }
        }

        return null;
    }

	factory.formatTime = function(time) {

		var mm = Math.floor(time / 60);
		var ss = Math.floor(time - (mm * 60));
		var mins = mm < 10 ? "0" + mm : mm;
		var secs = ss < 10 ? "0" + ss : ss;

		return mins + ":" + secs;
	};

	factory.supportsFullscreen = function() {

		if (typeof $document[0].documentElement.webkitRequestFullScreen != "undefined" 
            || typeof $document[0].documentElement.mozRequestFullScreen != "undefined"
            || typeof $document[0].documentElement.requestFullScreen != "undefined") {
            return true;
        }

        return false;
	};

	factory.supportsVideo = function() {
                
        var video = $document[0].createElement('video');
        var supports = !!video.canPlayType;
        var test = null;

        if (supports) {
            
            test = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
            
            if (video.canPlayType(test)) {
                test = null;
                video = null;
                return {
                    type : "video/mp4",
                    extension : ".mp4"
                };
            }
            else {
            	supports = false;
            }
        }
        
        video = null;
        return supports;
    };

    factory.uniqueId = function() {

		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ".split(""),
            id = "",
            i = 0,
            len = 10;

        function build() {

        	var isUnique = true;

        	function generate() {

	        	var temp = "";

	        	for (i = 0; i < 10; i++) {
		            temp = temp + chars[Math.floor(Math.random() * chars.length)];
		        }

		        return temp;
	        }

	        id = generate();

	        for (i=0;i<ids.length;i++) {

	        	if (id === ids[i]) {
	        		isUnique = false;
	        	}
	        }

	        if (!isUnique) {
	        	build();
	        }
	        else {
	        	ids.push(id);
	        }
        }

        build();

        return id;
	};

	return factory;
	
}])

.factory('vido.window', ['$window', '$rootScope', function($window, $rootScope) {
	
	'use strict';
	
	var service = angular.element($window);

	service.on('resize', function() {
        $rootScope.$broadcast('window.resize');
    });

    service.on('scroll', function() {
        $rootScope.$broadcast('window.scroll');
    });

    service.on('click', function() {
        $rootScope.$broadcast('window.click');
    });

	return service;
	
}]);