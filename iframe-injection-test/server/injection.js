(function(XHR) {
    "use strict";

    var stats = [];
    var timeoutId = null;

    var open = XHR.prototype.open;
    var send = XHR.prototype.send;

    XHR.prototype.open = function(method, url, async, user, pass) {
        console.log("open: " + url);
        this._url = url;
        open.call(this, method, url, async, user, pass);
    };

    XHR.prototype.send = function(data) {
        var self = this;
        var start;
        var oldOnReadyStateChange;
        var url = this._url;

        function onReadyStateChange() {
            if (self.readyState == 4 /* complete */ ) {
                var time = new Date() - start;
                console.log({
                    url: url,
                    duration: time
                });
            }

            if (oldOnReadyStateChange) {
                oldOnReadyStateChange();
            }
        }

        if (!this.noIntercept) {
            start = new Date();

            if (this.addEventListener) {
                this.addEventListener("readystatechange", onReadyStateChange, false);
            } else {
                oldOnReadyStateChange = this.onreadystatechange;
                this.onreadystatechange = onReadyStateChange;
            }
        }

        send.call(this, data);
    }
})(XMLHttpRequest);

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed

	var all = document.getElementsByTagName("*");

	for (var i = 0, max = all.length; i < max; i++) {
	    var ele = all[i];
	    if (ele.id.indexOf("VDOXPlayerFlash_") > -1 && (ele.id.match(/_/g) || []).length === 2) {
			console.log("found");
			console.log(ele.id);
	        playerInstance = jwplayer(ele.id);
	    }
	}


	base64urlEncode = function(unencoded) {
	  var encoded = window.btoa(unencoded);
	  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	};

	window.jQuery.ajax = (function() {
		console.log("overwriting");
	    var original_func = window.jQuery.ajax;

		window.jQuery.origajax = original_func;

        return function() {
			console.log("ajax");

			if (arguments.length == 1) {
				console.log("length1");
				var url = arguments[0]['url'];

				// // check if this is the url asking for the first m3u8
				// if (url.indexOf('protocol=http&output=m3u8') > -1) {
				// 	console.log("found playlist");
				// 	// replace their url with our own
				// }

				var newurl = 'http://localhost:3000/proxy/?orig=' + base64urlEncode(url);

				arguments[0]['url'] = newurl;

            	return original_func(arguments[0]);
			}
			else if (arguments.length == 2) {
				console.log("length2");
				var url = arguments[0];
            	return original_func(arguments[0], arguments[1]);
			}
			else {
				alert("bad");
			}
			console.log("url");
        }

	})();









	// Code below is calling to the server when jw player API calls happen














	function send2server(data) {
		data.timestamp = new Date().getTime();
		window.jQuery.origajax({
			url: 'http://localhost:3000/api/playerinfo',
			data: data
		});
	}

	playerInstance.onQualityLevels( function(array) {
		console.log("new qualities");
		var levels = {};
		for (key in array.levels) {
			console.log(key);
			console.log(array.levels[key]);
			levels[key] = levels[key];
		}
		var obj = {eventType: "new-quality-levels", levels: levels, string: levels.length+" new quality options have been added"};
		send2server(obj);
	});


	// Fired when the active quality level is changed. Happens in response to e.g. a user clicking the controlbar quality menu or a script calling setCurrentQuality. Event attributes:
	//
	// 	currentQuality (Number): index of the new quality level in the getQualityLevels() array.
	//
	playerInstance.onQualityChange (function(newquality) {
		var obj = {eventType: "quality-change", newquality: newquality, string: "Changed to quality level: "+newquality};
		send2server(obj);
	});



	playerInstance.onMeta( function(event) {
		console.log("META");
		console.log(event.metadata);
		var obj = event.metadata;
		obj.eventType = "meta";
        obj.string = "New meta data.";
        if (event.metadata.bandwidth) {
            obj.string += " Bandwidth: "+event.metadata.bandwidth;
        }
		send2server(obj);
	});

	// Get the rendering mode (html5 or flash) that the player has chosen
	var renderingMode = playerInstance.getRenderingMode();
	var obj = {eventType: "renderingMode", renderingMode: renderingMode, string: "Using rendering: "+renderingMode};
	send2server(obj);

	// Called when the player has initialised and is ready for playback
	playerInstance.onReady(function() {
		var obj = {eventType: "ready", string: "Player ready"};
		send2server(obj);
	});

	// onPlaylistItem(callback)
    // Fired when the playlist index changes to a new playlist item. This event occurs before the player begins playing the new playlist item. Event attributes:
	//
    //     index (Number): Zero-based index into the playlist array (e.g. 0 is the first item).
    //     playlist (Array): The new playlist; an array of playlist items.
	//
	playerInstance.onPlaylistItem(function (index, playlist) {
		var obj = {eventType: "new-playlist-item", index: index, playlist: playlist, string: "Item added to playlist"};
		send2server(obj);
	});


	// Fired when the player enters the PLAYING state. Event attributes:
	//
	// 	oldstate (String): the state the player moved from. Can be BUFFERING or PAUSED.
	//
	playerInstance.onPlay(function(oldstate) {
		var obj = {eventType: "playstate-change", newstate: "playing", oldstate: oldstate, string:"Now playing video"};
		send2server(obj);
	});


	// Fired when the player enters the PAUSED state. Event attributes:
	//
    //     oldstate (String): the state the player moved from. Can be BUFFERING or PLAYING.
	//
	playerInstance.onPause(function(oldstate) {
		var obj = {eventType: "playstate-change", newstate: "paused", oldstate: oldstate, string:"Now paused video"};
		send2server(obj);
	});

	// Fired when the player enters the BUFFERING state. Event attributes:
	//
    //     oldstate (String): the state the player moved from. Can be IDLE, PLAYING or PAUSED.
	//
	playerInstance.onBuffer(function(oldstate) {
		var obj = {eventType: "playstate-change", newstate: "buffering", oldstate: oldstate, string:"Now buffering"};
		send2server(obj);
	});


	// Fired when the player enters the IDLE state. Event attributes:
	//
	// 	oldstate (String): the state the player moved from. Can be BUFFERING, PLAYING or PAUSED.
	//
	playerInstance.onIdle(function(oldstate) {
		var obj = {eventType: "playstate-change", newstate: "idle", oldstate: oldstate, string:"Now idle"};
		send2server(obj);
	});

	// Fired when an item completes playback. It has no event attributes.
	playerInstance.onComplete(function() {
		var obj = {eventType: "playback-complete", string:"Playback complete"};
		send2server(obj);
	});


	// Fired when a media error has occurred, causing the player to stop playback and go into IDLE mode. Event attributes:
	//
	// 	message (String): The reason for the error. See Troubleshooting your Setup for a list of possible media errors.
	//
	playerInstance.onError(function(message) {
		var obj = {eventType: "playback-error", message: message, string:"Playback error: "+message};
		send2server(obj);
	})










},false);
