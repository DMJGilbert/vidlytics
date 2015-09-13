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

Api.addRoute('playerinfo', {
	authRequired: false
}, {
	get: function () {
		var cookie = this.request.headers['cookie'];

		var ident = readCookie(cookie, 'ident');

		var stream = Streams.find({
			'viewers.ident': ident
		}).fetch()[0];

		console.log(this);

		var newStream = stream;
		var data = this.queryParams;
		data.timestamp = new Date(parseInt(data.timestamp));
		stream.viewers.forEach(function (view, index) {
			if (view.ident == ident) {
				stream.viewers[index].event.push(data);
			}
		});
		stream.$save();

		return {
			success: true
		}
	}
});

Api.addRoute('meta', {
	authRequired: false
}, {
	get: function () {
		var cookie = this.request.headers['cookie'];

		var ident = readCookie(cookie, 'ident');

		var stream = Streams.find({
			'viewers.ident': ident
		}).fetch()[0];

		console.log(this);

		var newStream = stream;
		var data = this.queryParams;
		data.timestamp = new Date(parseInt(data.timestamp));
		stream.viewers.forEach(function (view, index) {
			if (view.ident == ident) {
				stream.viewers[index].meta.push(data);
			}
		});
		stream.$save();

		return {
			success: true
		}
	}
});

Api.addRoute('meta', {
	authRequired: false
}, {
	get: function () {
		var cookie = this.request.headers['cookie'];

		var ident = readCookie(cookie, 'ident');

		var stream = Streams.find({
			'viewers.ident': ident
		}).fetch()[0];

		console.log(this);

		var newStream = stream;
		var data = this.queryParams;
		data.timestamp = new Date(parseInt(data.timestamp));
		stream.viewers.forEach(function (view, index) {
			if (view.ident == ident) {
				stream.viewers[index].meta.push(data);
			}
		});
		stream.$save();

		return {
			success: true
		}
	}
});

Api.addRoute('triangulate', {
	authRequired: false
}, {
	get: function () {
		var cookie = this.request.headers['cookie'];

		var ident = readCookie(cookie, 'ident');

		var stream = Streams.find({
			'viewers.ident': ident
		}).fetch()[0];

		var newStream = stream;
		var data = this.queryParams;

		stream.viewers.forEach(function (view, index) {
			if (view.ident == ident) {
				stream.viewers[index].clientToServer = data.clientToServer;
				stream.viewers[index].clientToCDN = data.clientToCDN;
			}
		});
		stream.$save();

		return {
			success: true
		}
	}
});


//EG: /api/video?origin=aHR0cDovL3Jyci5zei54bGNkbi5jb20vP2FjY291bnQ9c3RyZWFtemlsbGEmZmlsZT1TdHJlYW16aWxsYV9EZW1vLnNtaWwmdHlwZT1zdHJlYW1pbmcmc2VydmljZT11c3AmcHJvdG9jb2w9aHR0cHMmb3V0cHV0PXBsYXllciZwb3N0ZXI9U3RyZWFtemlsbGFfRGVtby5wbmc
Api.addRoute('video', {
	authRequired: false
}, {
	get: function () {
		var url = base64urlDecode(this.queryParams.origin);

		var ident = Math.random() * 10000;

		var ip = this.request.headers['x-forwarded-for'];
		if (ip == "127.0.0.1") {
			ip = '';
		}
		var geoRequest = extractGeo(Meteor.http.get('https://iplocation.net?query=' + ip).content);

		var startTime = new Date().getTime();
		var request = Meteor.http.get(url);


		Streams.update({
			base64: this.queryParams.origin
		}, {
			$push: {
				viewers: {
					ident: ident,
					ip: this.request.headers['x-forwarded-for'],
					device: this.request.headers['user-agent'],
					long: geoRequest.long,
					lat: geoRequest.lat,
					country: geoRequest.country,
					region: geoRequest.region,
					city: geoRequest.city,
					isp: geoRequest.isp,
					started: new Date(),
					event: [],
					meta: [],
					serverToCDN: new Date().getTime() - startTime
				}
			}
		});

		var request = Meteor.http.get(url);
		var injectThis = fs.readFileSync('../server/assets/app/injection-meta.inject.js', 'utf8');
		var injected = request.content.replace('<head>', '<head><base href="' + url + '" target="_blank"><script>' + injectThis + '</script>');
		this.response.writeHead(200, {
			'Set-Cookie': 'ident=' + ident + ';Path=/;'
		});
		this.response.write(injected);
		this.done()
	}
});

function extractGeo(body) {
	var search = "</div><table width='655' cellspacing='0' cellpadding='0' border='0'><tr><td bgcolor='#336666' colspan='5' height='2'>        <spacer type='block' height='2'></td></tr><tr bgcolor='#99CCCC'><td width='17%'>IP Address</td><td width='18%'>Country</td><td width='15%'>Region</td><td width='15%'>City</td><td width='35%'>ISP</td></tr><tr><td bgcolor='#336666' colspan='5' height='2'>        <spacer type='block' height='2'></td></tr><tr>";

	var a = body.indexOf(search);

	var start = a + search.length;

	var temp = body.substr(start);

	temp = temp.substr(15);

	var end = temp.indexOf('</td></tr><tr>');

	temp = temp.substr(0, end);

	var splits = temp.split(/(<\/td><td>)/);

	var country = splits[2].substr(0, splits[2].indexOf(' <img'));



	// now lat long

	var search = "DB-IP</a>";
	var a = body.indexOf(search);
	var start = a + search.length;

	var temp = body.substr(start);

	var end = temp.indexOf("<a href='http://maps.google.com/");
	temp = temp.substr(0, end);

	var search = "<td width='80'>Longitude</td><td width='160'>Organization</td></tr><tr><td bgcolor='#336666' colspan='5' height='2'>";
	var start = temp.indexOf(search);
	temp = temp.substr(start + search.length);

	var search = "</td></tr><tr><td width='100'>";
	var start = temp.indexOf(search);
	temp = temp.substr(start + search.length);

	var search = "</td></tr><tr>";
	var end = temp.indexOf(search);
	temp = temp.substr(0, end);

	var splitsLatLong = temp.split(/(<\/td><td>)/);

	var out = {
		"ip": splits[0],
		"country": country,
		"region": splits[4],
		"city": splits[6],
		"isp": splits[8],
		"lat": splitsLatLong[4],
		"long": splitsLatLong[6]
	};

	return out;
}

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

	var cookie = req.request.headers['cookie'];

	var ident = readCookie(cookie, 'ident');

	console.log('Ident: ' + ident);

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

			obj.data = newurl;

			temp = JSON.stringify(obj);

			newbody = request.content.substr(0, a) + temp + ')';

			var stream = Streams.find({
				'viewers.ident': ident
			}).fetch()[0];

			var newStream = stream;
			stream.viewers.forEach(function (view, index) {
				if (view.ident == ident) {
					stream.viewers[index].event.push({
						message: 'HTTP request for: ' + url,
						timestamp: new Date()
					});
				}
			});
			stream.$save();


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

		var stream = Streams.find({
			'viewers.ident': ident
		}).fetch()[0];

		var newStream = stream;
		stream.viewers.forEach(function (view, index) {
			if (view.ident == ident) {
				stream.viewers[index].event.push({
					message: 'HTTP request for: ' + origreq,
					timestamp: new Date()
				});
			}
		});
		stream.$save();

		var newbody = lines.join("\n");

		req.response.write(newbody);
		req.done()
	}

	// Check to see if they are requesting a final TS file
	else if (origreq.indexOf('.ts') > -1) {

		var a = origreq.lastIndexOf('/') + 1;
		var start = origreq.substring(0, a);
		var file = origreq.substring(a);

		var stream = Streams.find({
			'viewers.ident': ident
		}).fetch()[0];

		var newStream = stream;
		stream.viewers.forEach(function (view, index) {
			if (view.ident == ident) {
				stream.viewers[index].event.push({
					message: 'HTTP request for: ' + origreq,
					timestamp: new Date()
				});
			}
		});
		stream.$save();

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

function readCookie(cookie, name) {
	name = name.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	var regex = new RegExp('(?:^|;)\\s?' + name + '=(.*?)(?:;|$)', 'i'),
		match = cookie.match(regex);
	return match[0].replace('; ' + name + '=', '').replace(';', '').trim();
}
