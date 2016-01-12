var canSsr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");

describe("async rendering", function(){
	before(function(){
		this.render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender",
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js")
			}
		});
	});

	it("basics works", function(done){
		this.render("/").then(function(result){
			var node = helpers.dom(result.html);

			var message = node.getElementById("orders");

			assert(message, "Found the message element that was rendered" +
				   "asynchronously");

			var cache = helpers.getInlineCache(node);

			assert(cache.restaurant["{\"foo\":\"foo\"}"],
				  "foo key added for restaurant");
			assert(cache.restaurant["{\"bar\":\"bar\"}"],
				  "bar key added for restaurant");
		}).then(done, done);
	});
});
