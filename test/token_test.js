var path = require("path");
var assert = require("assert");
var ssr = require("../lib/");
var helpers = require("./helpers");
var through = require("through2");
var nock = require("nock");
// import the xhr polyfill
require('done-ssr-middleware/lib/xhr');

describe("authorization header / token async rendering", function() {
	this.timeout(10000);
	var render;

	before(function(){
		this.scope = nock("http://www.example.org", {
				reqheaders: {"authorization": function(val){
					return val === "fake-token";
				}}
			})
			.get("/session")
			.delay(20)
			.reply(
			function (uri, requestBody) {
				return [
					200,
					'["one","two"]'
				];
			}
		);
		render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "token/index.stache!done-autorender"
		});
	});

	after(function(){
		nock.restore();
	});


	it( "works", function(done){
		var stream = render({
			//mocked up req object
			url: "/",
			headers: {
				authorization: "fake-token"
			}
		});

		stream.pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);
			var successSpan = node.getElementById( "success" );
			assert.ok(successSpan);

			done();
		}));
	});
});
