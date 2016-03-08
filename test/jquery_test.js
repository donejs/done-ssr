var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Rendering a jQuery app", function(){
	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests/jquery", "package.json!npm"),
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js")
			}
		});
	});

	it("works asynchronously", function(done){
		this.render("/").pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			var app = node.getElementById("app");
			assert(app, "the #app rendered");

			var present = app.firstChild,
				future = present.nextSibling;
			assert.equal(helpers.text(present).trim(),
						 "Hello from the present");

			assert.equal(helpers.text(future).trim(),
						 "Hello from the future");
			done();
		}));
	});
});
