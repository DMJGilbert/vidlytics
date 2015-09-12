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

		var injectThis = fs.readFileSync('server/injection.js', 'utf8');

		var injected = body.replace('<head>', '<head><base href="' + url + '" target="_blank"><script>' + injectThis + '</script>');
		res.send(injected);
	});
})

server.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
