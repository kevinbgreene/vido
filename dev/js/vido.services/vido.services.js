angular.module('vido.services', [])

.factory('videoStore',
['$http', '$q', 'vido.config',
function($http, $q, config) {

	'use strict';

	var factory = {};
	var currentIndex = 0;
	
	var videos = {
		path : '',
		entries : []
	};

	var playlist = [];

	function loadVideos() {

		var deferred = $q.defer();

		if (videos.entries.length === 0) {

			$http({
				url: config.get('video-path'),
				method: 'GET'
			})
			.success(function(data) {

				videos.path = data.basePath;
				videos.entries = data.videos;

				deferred.resolve(videos.entries);
			});
		}
		else {
			deferred.resolve(videos);
		}

		return deferred.promise;
	}

	function returnVideoForId(id) {

		var vid = null;
		var temp = null;
		var i = 0;

		if (!id && playlist.length > 0) {
			
			return {
				video : playlist[0],
				index : 0
			};
		}
		else {

			temp = playlist.length > 0 ? playlist : videos.entries;

			for (i=0;i<temp.length;i++) {

				vid = temp[i];

				if (vid.id === id) {

					// vid.path = videos.path;

					return {
						video : vid,
						index : i
					};
				}
			}
		}
	}

	function loadPlaylistData(id) {

		var deferred = $q.defer();
		var playlistUrl = 'json/' + id + '.js';

		$http({
			url: playlistUrl,
			method: 'GET'
		})
		.success(function(data) {
			deferred.resolve(data);
		});

		return deferred.promise;
	}

	// TODO: Add Search
	factory.playlistFromSearch = function(search) {};

	factory.getPlaylist = function(id) {

		var deferred = $q.defer();
		var temp = [];
		var vid = null;

		$q.all([
			loadVideos(),
			loadPlaylistData(id)
		])
		.then(function(data) {
			
			for (var i=0; i<data[1].videos.length; i++) {

				for (var j=0; j<videos.entries.length; j++) {

					vid = videos.entries[j];
					vid.path = videos.path;

					if (vid.id === data[1].videos[i]) {
						temp.push(vid);
					}
				}
			}

			playlist = temp;
			deferred.resolve(playlist);
		});

		return deferred.promise;
	};

	factory.getById = function(id) {

		var deferred = $q.defer();

		loadVideos().then(function() {
			var obj = returnVideoForId(id);
			deferred.resolve(obj);
		});

		return deferred.promise;
	};

	factory.getCurrentVideo = function() {
		return factory.getById(currentIndex);
	};

	return factory;

}]);