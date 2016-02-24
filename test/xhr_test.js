var path = require("path");
var nock = require("nock");
var assert = require("assert");
var canSsr = require("../lib/");
var helpers = require("./helpers");

require("../lib/middleware/xhr");

describe("xhr async rendering", function() {
	var render;
	var scope;

	before(function() {
		scope = nock("http://www.example.org")
			.get("/api/list")
			.delay(20)
			.reply(200, [1, 2, 3, 4, 5]);

		render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "xhr/index.stache!done-autorender",
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js")
			}
		});
	});

	after(function() {
		nock.restore();
	});

	it("works", function(done) {
		assert(!scope.isDone(), "request not ready");
		
		var renderProm = render("/");

		return renderProm.then(function(result) {
			var node = helpers.dom(result.html);
			var listItems = node.getElementsByTagName('li');

			assert(scope.isDone(), 'request should be trapped');
			assert.equal(listItems.length, 5, 'there should be 5 items');
			done();
		});
	});
});
