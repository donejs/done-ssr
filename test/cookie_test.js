var path = require("path");
var nock = require("nock");
var assert = require("assert");
var canSsr = require("../lib/");
var helpers = require("./helpers");

require("../lib/middleware/xhr")( global );

describe("cookie async rendering", function() {
	var render;
	var scope;
	var cookieValue = "";

	before(function() {
		scope = nock("http://www.example.org", {
			reqheaders: {
				cookie: function ( headerValueSentOnRequest ) {
					cookieValue = headerValueSentOnRequest;
					return true;
				}
			}
		}).get( "/session" ).delay( 20 ).reply(
			200,
			function ( uri, requestBody ) {
				return cookieValue;
			}
		);

		render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "cookie/index.stache!done-autorender",
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js")
			}
		});
	});

	after(function() {
		nock.restore();
	});

	it( "works", function ( done ) {
		assert( !scope.isDone(), "request not ready" );

		var renderProm = render({
			//mocked up req object
			url: "/",
			headers: {
				cookie: "willitcookie=letsfindout"
			}
		});

		return renderProm.then( function ( result ) {
			var node = helpers.dom( result.html );
			var cookieAttachedToSSRAjaxReq = node.getElementById( "cookieAttachedToSSRAjaxReq" ).innerHTML;
			var cookieOnSSRDocument = node.getElementById( "cookieOnCurrentDocument" ).innerHTML;

			assert( scope.isDone(), "request should be trapped" );

			//TODO: this assertion should be false unless CORS is enabled ( will need to test both situations once this is handled )
			assert.equal( cookieAttachedToSSRAjaxReq, "willitcookie=letsfindout", "The cookie was sent with the SSR'd ajax req" );
			
			assert.equal(
				cookieOnSSRDocument,
				"willitcookie=letsfindout; newCookieKey=newCookieValue",
				"The cookie was on the doc when it was ssr'd and the polyfil works"
			);
			done();
		});
	});
});
