var canSsr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");

describe("rendering a JavaScript main", function(){
	before(function(){
		this.render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "plain/main",
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js"),
				"can-ssr/import": "file:" + path.resolve(__dirname + "/../import.js")
			}
		});
	});

	it("returns only the css needed for the request", function(done){
		var render = this.render;

		var checkCount = function(result, expected, message){
			var node = helpers.dom(result.html);

			var styles = helpers.count(node, function(el){
				return el.nodeName === "STYLE";
			});

			assert.equal(styles, expected, message + " | " + styles +
						 " !== " + expected);
		};

		render("/orders").then(function(result){
			checkCount(result, 2, "There should be 2 styles for the orders page");

			return render("/");
		}).then(function(result){
			checkCount(result, 1, "There should only be 1 style for the root page");
		})
		.then(done, done);
	});
});
