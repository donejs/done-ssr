var canSsr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");

describe("Using custom plugins", function(){
	before(function(){
		this.render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "plugins/index.stache!done-autorender",
		}, {
			plugins: [ "foo" ]
		});
	});

	it("basics works", function(done){
		this.render("/").then(function(result){
			var node = helpers.dom(result.html);

			var foo = node.getElementById("foo");
			assert(foo, "foo element is shown because the plugin loaded");
		}).then(done);
	});
});
