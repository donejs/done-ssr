var assert = require('assert');
var path = require('path');
var request = require('request');
var nock = require( "nock" );

var serve = require('../lib/server');


describe("cookie async rendering", function() {
	var scope;
	var server;

	before(function(done) {
		server = serve({
			path: path.join(__dirname, 'tests'),
			main: "cookie/index.stache!done-autorender"
		}).listen(5050);

		scope = nock("http://www.example.org").get( "/session" ).delay( 20 ).reply(
			function ( uri, requestBody ) {
				return [
					200,
					"request body",
					{ "set-cookie": "ajaxResDurringSSR=setsACookie" }
				];
			}
		);

		server.on('listening', done);
	});

	after(function(done) {
		nock.restore();
		server.close(done);
	});

	it.only('starts SSR with package.json settings and outputs page with 200 status', function(done) {
		var j = request.jar();
		request({ url: 'http://localhost:5050', jar: j }, function(err, res, body) {
			var cookie_string = j.getCookieString( "http://localhost:5050/" );
			assert.equal(cookie_string, "newCookieKey=newCookieValue; ajaxResDurringSSR=setsACookie", "Cookies created from ajax response during SSR are forwarded to the initial ssr response.");
			done();
		});
	});
});
