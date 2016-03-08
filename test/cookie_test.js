var path = require("path");
var nock = require("nock");
var assert = require("assert");
var ssr = require("../lib/");
var helpers = require("./helpers");
var through = require("through2");

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

		render = ssr({
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

	it( "works", function(done){
		assert( !scope.isDone(), "request not ready" );

		var stream = render({
			//mocked up req object
			url: "/",
			headers: {
				cookie: "willitcookie=letsfindout"
			}
		});

		stream.pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);
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
		}));
	});
});
