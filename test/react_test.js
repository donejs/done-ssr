var canSsr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");

describe("rendering a React app", function(){
	before(function(){
		this.render = canSsr({
			config: "file:" + path.join(__dirname, "tests/react",
										"package.json!npm")
		});
	});

	it("works asynchronously", function(done){
		this.render("/").then(function(result){
			var node = helpers.dom(result.html);

			var app = node.getElementById("main");
			assert(app, "the #main rendered");

			var present = app.firstChild,
				future = present.nextSibling;
			assert.equal(helpers.text(present).trim(),
						 "Hello from the present");

			assert.equal(helpers.text(future).trim(),
						 "Hello from the future");
		}).then(done, done);
	});
});
