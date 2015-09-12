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

    playerInstance.onQualityLevels( function(array) {
        console.log("new qualities");
        for (key in array.levels) {
            console.log(key);
            console.log(array.levels[key]);
        }
    });

	playerInstance.onMeta( function(event) { console.log(event.metadata);});


},false);
