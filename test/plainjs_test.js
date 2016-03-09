var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Rendering a JavaScript main", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "plain/main",
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js"),
				"done-ssr/import": "file:" + path.resolve(__dirname + "/../import.js")
			}
		});
	});

	it("returns only the css needed for the request", function(done){
		var render = this.render;

		var checkCount = function(html, expected, message){
			var node = helpers.dom(html);

			var styles = helpers.count(node, function(el){
				return el.nodeName === "STYLE";
			});

			assert.equal(styles, expected, message + " | " + styles +
						 " !== " + expected);
		};

		var ordersStream = render("/orders");
		ordersStream.on("error", done);

		ordersStream.pipe(through(function(buffer){
			checkCount(buffer.toString(), 2,
					   "There should be 2 styles for the orders page");

			var rootStream = render("/");
			rootStream.on("error", done);
			rootStream.pipe(through(function(buffer){
				checkCount(buffer.toString(), 1,
						   "There should only be 1 style for the root page");
				done();
			}));
		}));
	});
});
