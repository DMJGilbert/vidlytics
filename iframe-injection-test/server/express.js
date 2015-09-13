var express = require('express');
var path = require('path');
var app = express();

var server = require('http').createServer(app);

var request = require('request');
var fs = require('fs');

// all environments
app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text) {
        res.send(text);
    });
});


app.get('/crossdomain.xml', function(req, res) {
    res.send('<?xml version="1.0" encoding="UTF-8"?><cross-domain-policy xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.adobe.com/xml/schemas/PolicyFile.xsd">'
	+'<allow-access-from domain="*" to-ports="*" secure="false"/><site-control permitted-cross-domain-policies="all"/><allow-http-request-headers-from domain="*" headers="*"/></cross-domain-policy>');
});

app.get('/video', function(req, res) {
	var url = "http://rrr.sz.xlcdn.com/?account=streamzilla&file=Streamzilla_Demo.smil&type=streaming&service=usp&protocol=https&output=player&poster=Streamzilla_Demo.png";
    request(url, function(err, resp, body) {

        var injectThis = fs.readFileSync('server/injection.js', 'utf8');

        var injected = body.replace('<head>', '<head><base href="' + url + '" target="_blank"><script>' + injectThis + '</script>');
        res.send(injected);
    });
});

app.get('/proxy/*', function(req, res) {

	console.log("---- new req");

    var base64urlEncode = function(unencoded) {
        var buf = new Buffer(unencoded);
        var encoded = buf.toString('base64');
        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    var base64urlDecode = function(encoded) {
        encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (encoded.length % 4)
            encoded += '=';
        var buf = new Buffer(encoded, 'base64');
        var decoded = buf.toString();
        return decoded;
    };

	if (req.query['orig']) {
	    var origreq = base64urlDecode(req.query['orig']);
		if (req.query.callback) {
	    	origreq += '&callback=' + req.query.callback;
		}
		if (req.query['_']) {
	    	origreq += '&_=' + req.query['_'];
		}
	}
	else {
		var origreq = '';
	}

    var newbody = '';

    if (origreq.indexOf('&protocol=http&output=playlist.m3u8&format=jsonp') > -1) {
		// This is the first, original playlist request than returns a URL of the location of a playlist
        request(origreq, function(err, resp, body) {
            var newbody = '';

            // Check if this is a link to a m3u8 file within the original request
            if (body.indexOf(".m3u8") > -1) {

                // This is the original playlist request
                // Example response:
                // jQuery21009100910511333495_1442063036637({"data":"http:\/\/usp.cr2.streamzilla.xlcdn.com\/36405f865d4eef1950428f2f83b16149\/55f422bf\/sz\/streamzilla\/Streamzilla_Demo.smil\/Streamzilla_Demo.m3u8"})
                var a = body.indexOf('(') + 1;
                var temp = body.substr(a);
                var b = temp.indexOf(')');
                temp = temp.substr(0, b);
                var obj = JSON.parse(temp);
                var url = obj.data;

                newurl = 'http://vidlytics.meteor.com/proxy/Streamzilla_Demo.m3u8?orig=' + base64urlEncode(url) + "";

                obj.data = newurl;

                temp = JSON.stringify(obj);

                newbody = body.substr(0, a) + temp + ')';

                res.send(newbody);
            }
        });
    }

	// This is a playlist file, we should edit its contents to be proxied by us
	else if (origreq.indexOf('.m3u8') > -1) {

		var a = origreq.lastIndexOf('/')+1;
		var start = origreq.substring(0, a);


		request(origreq, function(err, resp, body) {
			// Split the body of the playlist up into lines

			var lines = body.split("\n");

			// Loop over the lines in the file
			for (var i=0; i<lines.length; i++) {
				var line = lines[i];
				// If lines start with a hash sign then they are comments
				if (line.substr(0, 1) != '#') {
					// This is a line that is a url of a file
					var fullOrigLink = start + line;
					var newurl = 'http://vidlytics.meteor.com/proxy/'+line+'?orig=' + base64urlEncode(fullOrigLink) + "";
					lines[i] = newurl;
				}
			}

			var newbody = lines.join("\n");

            res.send(newbody);
        });
	}

	// Check to see if they are requesting a final TS file
	else if (origreq.indexOf('.ts') > -1) {

		var a = origreq.lastIndexOf('/')+1;
		var start = origreq.substring(0, a);
		var file = origreq.substring(a);

		console.log(new Date().toISOString() + " Requesting: " + file );

		res.redirect(origreq);
	}
	else {
		console.log("ELSE");
	}


})

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
