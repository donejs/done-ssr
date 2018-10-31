var assert = require("assert");
var path = require("path");
var nock = require("nock");
var through = require("through2");

var ssr = require("../lib/index");

describe("Using can-fixture", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "fixtures/index.stache!done-autorender"
		}, {
			strategy: 'safe',
		});

		this.scope = nock("http://www.example.org")
			.get("/stuff")
			.delay(20)
			.reply(
			function (uri, requestBody) {
				return [
					200,
					'["one","two"]'
				];
			}
		);
	});

	after(function(){
		nock.restore();
	});


	it("Returns a response", function(done){
		var response = through(function(buffer){
			assert.equal(response.statusCode, 200, "Got a 200 response");
			done();
		});
		this.render("/").pipe(response);
	});
});
