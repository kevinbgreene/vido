﻿package src.ui {		import flash.display.Sprite;	import flash.display.StageDisplayState;		import flash.display.GradientType;	import flash.display.SpreadMethod;	import flash.geom.Matrix;		import flash.events.MouseEvent;	import flash.net.NetStream;	import flash.system.Capabilities;		import caurina.transitions.Tweener;		import src.ui.PlayButton;	import src.ui.FullScreenButton;	import src.ui.ScrubBar;	import src.ui.ShareButton;	import src.ui.SourceButton;		import src.events.VideoControllerEvent;	import src.events.VideoScrubEvent;		public class VideoController extends Sprite {				// ELEMENT DIMENSIONS				private var thisHeight:Number;		private var thisWidth:Number;				// GRADIENT VARS				private var colors:Array;		private var alphas:Array;		private var ratios:Array;		private var matrix:Matrix;				private var videoControllerBackground:Sprite;				private var progressBar:ScrubBar;				// BUTTONS				private var playControl:PlayButton;		private var fullScreenControl:FullScreenButton;		private var muteControl:MuteButton;		private var shareControl:ShareButton;		private var sourceControl:SourceButton;		public function VideoController(tWidth:Number) {						thisHeight = 65;			thisWidth = tWidth;						colors = [0x444444, 0x111111];			alphas = [1, 1];			ratios = [0, 1];			matrix = new Matrix();			matrix.createGradientBox(thisWidth, thisHeight, Math.PI/2, 0, 0);						videoControllerBackground = new Sprite();						with (videoControllerBackground.graphics) {				clear();				beginGradientFill(GradientType.LINEAR, colors, alphas, ratios, matrix, SpreadMethod.PAD);				drawRect(0, 0, thisWidth, thisHeight);				endFill();			}						videoControllerBackground.y = 15;						progressBar = new ScrubBar(thisWidth);			progressBar.addEventListener(VideoScrubEvent.VIDEO_SCRUB, scrubVideo);			progressBar.addEventListener(VideoScrubEvent.VIDEO_SCRUBBED, videoScrubbed);						progressBar.x = 0;			progressBar.y = 0;						playControl = new PlayButton();			playControl.addEventListener(MouseEvent.CLICK, playButtonClicked);			playControl.x = 20;			playControl.y = 25;						muteControl = new MuteButton();			muteControl.addEventListener(MouseEvent.CLICK, muteButtonClicked);			muteControl.x = 65;			muteControl.y = 20;						sourceControl = new SourceButton();			sourceControl.addEventListener(MouseEvent.CLICK, sourceButtonClicked);			sourceControl.x = thisWidth - 97 - 60 - 10 - 10;			sourceControl.y = 20;						shareControl = new ShareButton();			shareControl.addEventListener(MouseEvent.CLICK, shareButtonClicked);			shareControl.x = thisWidth - 97 - 85 - 60 - 10 - 10 - 10;			shareControl.y = 25;			shareControl.visible = false;						fullScreenControl = new FullScreenButton();			fullScreenControl.addEventListener(MouseEvent.CLICK, fullscreenButtonClicked);			fullScreenControl.x = thisWidth - 97 - 10;			fullScreenControl.y = 25;						addChild(videoControllerBackground);			addChild(playControl);			addChild(muteControl);			addChild(sourceControl);			addChild(shareControl);			addChild(fullScreenControl);			addChild(progressBar);		}				public function addShareButton():void {			shareControl.visible = true;		}				public function reset():void {			progressBar.reset();			playControl.isPaused();		}				public function update(prog:String):void {			progressBar.update(prog);		}				public function updateLoaded(loaded:Number):void {			progressBar.updateLoaded(loaded);		}				public function format(tWidth:Number):void {						thisWidth = tWidth;						progressBar.format(thisWidth);			sourceControl.x = thisWidth - 97 - 60 - 10 - 10;			shareControl.x = thisWidth - 97 - 85 - 60 - 10 - 10 - 10;			fullScreenControl.x = thisWidth - 97 - 10;						with (videoControllerBackground.graphics) {				clear();				beginGradientFill(GradientType.LINEAR, colors, alphas, ratios, matrix, SpreadMethod.PAD);				drawRect(0, 0, thisWidth, thisHeight);				endFill();			}		}				private function fullscreenButtonClicked(e:MouseEvent):void {			dispatchEvent(new VideoControllerEvent(VideoControllerEvent.FULL_CLICKED));		}				private function playButtonClicked(e:MouseEvent):void {			dispatchEvent(new VideoControllerEvent(VideoControllerEvent.PLAY_CLICKED));		}				private function muteButtonClicked(e:MouseEvent):void {			dispatchEvent(new VideoControllerEvent(VideoControllerEvent.MUTE_CLICKED));		}				private function shareButtonClicked(e:MouseEvent):void {			dispatchEvent(new VideoControllerEvent(VideoControllerEvent.SHARE_CLICKED));		}				private function sourceButtonClicked(e:MouseEvent):void {			dispatchEvent(new VideoControllerEvent(VideoControllerEvent.CHANGE_SOURCE));		}				private function scrubVideo(e:VideoScrubEvent):void {			dispatchEvent(new VideoControllerEvent(VideoControllerEvent.VIDEO_SCRUB, e.scrubPercent));		}				private function videoScrubbed(e:VideoScrubEvent):void {			dispatchEvent(new VideoControllerEvent(VideoControllerEvent.VIDEO_SCRUBBED));		}				public function isPlaying() {			playControl.isPlaying();		}				public function isPaused() {			playControl.isPaused();		}				public function isMuted() {			muteControl.isMuted();		}				public function isUnmuted() {			muteControl.isUnmuted();		}				public function isFull():void {			fullScreenControl.isFull();		}				public function isNormal():void {			fullScreenControl.isNormal();		}				public function isHD():void {			sourceControl.isHD();		}				public function isSD():void {			sourceControl.isSD();		}	}}