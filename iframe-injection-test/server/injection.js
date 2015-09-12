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

	playerInstance.onQualityLevels( function(array) {
		console.log("new qualities");
		for (key in array.levels) {
			console.log(key);
			console.log(array.levels[key]);
		}
	});

	playerInstance.onMeta( function(event) { console.log(event.metadata);});


	// Send a request to server to setup this client stream
	//window.jQuery.post('http://localhost:3000/api/initialiseclient', {}, function(data, textStatus, jqxhr) { } );

},false);
