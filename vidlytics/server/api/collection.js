var fs = Meteor.npmRequire('fs');
var btoa = Meteor.npmRequire('btoa')

var base64urlEncode = function (unencoded) {
	var encoded = btoa(unencoded);
	return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

var base64urlDecode = function (encoded) {
	encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
	while (encoded.length % 4)
		encoded += '=';
	var buf = new Buffer(encoded, 'base64');
	var decoded = buf.toString();
	return decoded;
};

var Api = new Restivus({
	useDefaultAuth: false,
	authRequired: false,
	prettyJson: true,
	excludedEndpoints: true
});

Api.addRoute('initialiseClient', {
	authRequired: true
}, {
	post: function () {
		consoole.log(this.urlParams)
	}
});

//EG: /api/video?origin=aHR0cDovL3Jyci5zei54bGNkbi5jb20vP2FjY291bnQ9c3RyZWFtemlsbGEmZmlsZT1TdHJlYW16aWxsYV9EZW1vLnNtaWwmdHlwZT1zdHJlYW1pbmcmc2VydmljZT11c3AmcHJvdG9jb2w9aHR0cHMmb3V0cHV0PXBsYXllciZwb3N0ZXI9U3RyZWFtemlsbGFfRGVtby5wbmc
Api.addRoute('video', {
	authRequired: false
}, {
	get: function () {
		var url = base64urlDecode(this.queryParams.origin);
		var request = Meteor.http.get(url);
		var injectThis = fs.readFileSync('../server/assets/app/injection-meta.js.inject', 'utf8');
		var injected = request.content.replace('<head>', '<head><base href="' + url + '" target="_blank"><script>' + injectThis + '</script>');
		this.response.write(injected);
		this.done()
	}
});


Api.addRoute('proxy', {
	authRequired: false,
	roleRequired: false
}, {
	get: function () {
		proxyEndpoint(this);
	}
});
//
Api.addRoute('proxy/:_file', {
	authRequired: false
}, {
	get: function () {
		return proxyEndpoint(this);
	}
});

var proxyEndpoint = function (req) {
	if (req.queryParams.orig) {
		var origreq = base64urlDecode(req.queryParams.orig);
		if (req.queryParams.callback) {
			origreq += '&callback=' + req.queryParams.callback;
		}
		if (req.queryParams['_']) {
			origreq += '&_=' + req.queryParams['_'];
		}
	} else {
		var origreq = '';
	}

	var newbody = '';

	if (origreq.indexOf('&protocol=http&output=playlist.m3u8&format=jsonp') > -1) {
		// This is the first, original playlist request than returns a URL of the location of a playlist
		var request = Meteor.http.get(origreq);
		var newbody = '';

		// Check if this is a link to a m3u8 file within the original request
		if (request.content.indexOf(".m3u8") > -1) {

			// This is the original playlist request
			// Example response:
			// jQuery21009100910511333495_1442063036637({"data":"http:\/\/usp.cr2.streamzilla.xlcdn.com\/36405f865d4eef1950428f2f83b16149\/55f422bf\/sz\/streamzilla\/Streamzilla_Demo.smil\/Streamzilla_Demo.m3u8"})
			var a = request.content.indexOf('(') + 1;
			var temp = request.content.substr(a);
			var b = temp.indexOf(')');
			temp = temp.substr(0, b);
			var obj = JSON.parse(temp);
			var url = obj.data;

			var base64 = base64urlEncode(url);

			newurl = 'http://localhost:3000/api/proxy/Streamzilla_Demo.m3u8?orig=' + base64 + "";


			var stream = Streams.find({
				base64: base64
			});

			stream.viewers.push({
				ip: req.request.headers['x-forwarded-for'],
				device: req.request.headers['user-agent'],
				long: 0,
				lat: 0,
				started: new Date(),
				event: []
			});

			obj.data = newurl;

			temp = JSON.stringify(obj);

			newbody = request.content.substr(0, a) + temp + ')';

			req.response.write(newbody);
			req.done()
		}
	}
	// This is a playlist file, we should edit its contents to be proxied by us
	else if (origreq.indexOf('.m3u8') > -1) {

		var a = origreq.lastIndexOf('/') + 1;
		var start = origreq.substring(0, a);


		var request = Meteor.http.get(origreq);
		// Split the body of the playlist up into lines

		var lines = request.content.split("\n");

		// Loop over the lines in the file
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			// If lines start with a hash sign then they are comments
			if (line.substr(0, 1) != '#') {
				// This is a line that is a url of a file
				var fullOrigLink = start + line;
				var newurl = 'http://localhost:3000/api/proxy/' + line + '?orig=' + base64urlEncode(fullOrigLink) + "";
				lines[i] = newurl;
			}
		}

		var newbody = lines.join("\n");

		req.response.write(newbody);
		req.done()
	}

	// Check to see if they are requesting a final TS file
	else if (origreq.indexOf('.ts') > -1) {

		var a = origreq.lastIndexOf('/') + 1;
		var start = origreq.substring(0, a);
		var file = origreq.substring(a);
		console.log(new Date().toISOString() + " Requesting: " + file);
		console.log(origreq);
		return {
			statusCode: 301,
			headers: {
				'Location': origreq
			},
			body: 'BLEH'
		};
	} else {
		req.done();
	}
}
