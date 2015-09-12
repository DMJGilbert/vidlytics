var express = require('express');
var path = require('path');
var app = express();

var server = require('http').createServer(app);

var request = require('request');
var fs = require('fs');

// all environments
app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	fs.readFile(__dirname + '/public/index.html', 'utf8', function (err, text) {
		res.send(text);
	});
});


var url = "http://rrr.sz.xlcdn.com/?account=streamzilla&file=Streamzilla_Demo.smil&type=streaming&service=usp&protocol=https&output=player&poster=Streamzilla_Demo.png";
app.get('/video', function (req, res) {
	request(url, function (err, resp, body) {

		var injectThis = fs.readFileSync('server/injection-meta.js', 'utf8');

		var injected = body.replace('<head>', '<head><base href="' + url + '" target="_blank"><script>' + injectThis + '</script>');
		res.send(injected);
	});
});

app.get('/proxy', function (req, res) {



	base64urlDecode = function(encoded) {
		encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
		while (encoded.length % 4)
			encoded += '=';
		var buf = new Buffer(encoded, 'base64');
		var decoded = buf.toString();
		return decoded;
	};

	var origreq = base64urlDecode(req.query['orig']);
	origreq += '&callback=' + req.query.callback;
	origreq += '&_=' + req.query['_'];

	var newbody = '';

	console.log(origreq);
	request(origreq, function (err, resp, body) {
		console.log(body);
		newbody = body;
		res.send(newbody);
	});

	//console.log("before check");
	// Check if this is a link to a m3u8 file
	if (newbody.indexOf(".m3u8") > -1) {
		//console.log("yes playlist");

		// This is the original playlist request
		// Example response:
		// jQuery21009100910511333495_1442063036637({"data":"http:\/\/usp.cr2.streamzilla.xlcdn.com\/36405f865d4eef1950428f2f83b16149\/55f422bf\/sz\/streamzilla\/Streamzilla_Demo.smil\/Streamzilla_Demo.m3u8"})
		//var a = newbody.indexOf('":"');
		//var temp = newbody.substr(a);
		//console.log(temp);
	}

	// Here we will change the body to be more links to us to log the requests


})

server.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
