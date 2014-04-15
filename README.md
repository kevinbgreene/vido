# Vido

A HTML video player with Flash fallback. It's set up to load videos from an external json file, but can be easily set up to load videos from a backend service.

It accepts both playlists and individual videos.

## Usage

Configuration is done through a config serice that can be injected into the run phase of the angular application.

     angular.module('vido')

     .run(['vido.config', function(config) {
			
	 	config.set('video-path', 'json/videos.041114a.js');

	 }]);

In this case, the 'video-path' points to the json file containing the video data.