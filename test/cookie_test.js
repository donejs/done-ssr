var path = require("path");
var assert = require("assert");
var ssr = require("../lib/");
var helpers = require("./helpers");
var through = require("through2");

describe("cookie async rendering", function() {
	this.timeout(10000);

	var render;
	var cookieValue = "";

	before(function() {
		this.oldXHR = global.XMLHttpRequest;
		var XHR = global.XMLHttpRequest = helpers.mockXHR(function(){
			return cookieValue;
		});
		XHR.prototype.setRequestHeader = function(name, cookie){
			cookieValue = cookie;
		};
		XHR.prototype.getResponseHeader = function(name){
			if(name === "Set-Cookie") { return cookieValue; }
		};

		render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "cookie/index.stache!done-autorender"
		});
	});

	after(function() {
		global.XMLHttpRequest = this.oldXHR;
	});

	it( "works", function(done){
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
