var path = require("path");
var assert = require("assert");
var ssr = require("../lib/");
var helpers = require("./helpers");
var through = require("through2");

describe("cookie async rendering", function() {
	this.timeout(10000);

	var render;
	var cookieValue = "";

	before(function(done) {
		helpers.createServer(8070, function(req, res){
			cookieValue = req.headers.cookie;

			var value;
			switch(req.url) {
				case "/session":
					value = cookieValue;
					break;
				default:
					throw new Error("No route for " + req.url);
			}
			res.setHeader("Set-Cookie", cookieValue);
			res.end(value);
		})
		.then(server => {
			this.server = server;
			done();
		});

		render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "cookie/index.stache!done-autorender"
		}, {
			strategy: 'safe',
		});
	});

	after(function() {
		this.server.close();
	});

	it( "works", function(done){
		var stream = render({
			//mocked up req object
			method: "GET",
			url: "/",
			connection: {},
			headers: {
				host: "localhost",
				cookie: "willitcookie=letsfindout"
			},
			get: function(name) {
				return this.headers[name.toLowerCase()];
			}
		});

		stream.pipe(through(function(buffer){
			Promise.resolve().then(function(){
				var html = buffer.toString();

				var node = helpers.dom(html);
				var cookieAttachedToSSRAjaxReq = node.getElementById("cookieAttachedToSSRAjaxReq").innerHTML;
				var cookieOnSSRDocument = node.getElementById("cookieOnCurrentDocument").innerHTML;

				// TODO: this assertion should be false unless CORS is enabled
				// ( will need to test both situations once this is handled )
				assert.equal( cookieAttachedToSSRAjaxReq, "willitcookie=letsfindout",
					"The cookie was sent with the SSR'd ajax req" );

				assert.equal(
					cookieOnSSRDocument,
					"willitcookie=letsfindout; newCookieKey=newCookieValue",
					"The cookie was on the doc when it was ssr'd and the polyfil works"
				);
			}).then(done, done);
		}));
	});
});
