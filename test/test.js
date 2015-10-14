var canSsr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var	hasError = /Error:/;

describe("rendering an app", function(){
	before(function(){
		this.render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "progressive/index.stache!done-autorender",
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js")
			}
		});
	});

	it("basics works", function(done){
		this.render("/").then(function(result){
			var node = helpers.dom(result.html);

			var foundHome = false;
			helpers.traverse(node, function(el){
				if(el.nodeName === "DIV" && el.getAttribute("id") === "home") {
					foundHome = true;
				}
			});

			assert.equal(foundHome, true, "Found the 'home' element");
		}).then(done);
	});

	it("works with progressively loaded bundles", function(done){
		this.render("/orders").then(function(result){
			var node = helpers.dom(result.html);

			var found = {};
			helpers.traverse(node, function(el){
				if(el.nodeName === "STYLE" || el.nodeName === "SCRIPT") {
					found[el.getAttribute("asset-id")] = true;
				}
			});

			assert.ok(!hasError.test(result.html), 'does not print an error message');
			assert.equal(result.state.attr('statusCode'), 200);
			assert.equal(found["progressive/main.css!$css"], true, "Found the main css");
			assert.equal(found["progressive/orders/orders.css!$css"], true, "Found the orders bundle css");
			assert.equal(found["@inline-cache"], true, "The inline-cache was registered");
		}).then(done);
	});

	it("returns only the css needed for the request", function(done){
		var render = this.render;

		var checkCount = function(result, expected, message){
			var node = helpers.dom(result.html);

			var styles = helpers.count(node, function(el){
				return el.nodeName === "STYLE";
			});

			assert.equal(styles, expected, message);
		};

		render("/orders").then(function(result){
			checkCount(result, 2, "There should be 2 styles for the orders page");

			return render("/");
		}).then(function(result){
			checkCount(result, 1, "There should only be 1 style for the root page");

			done();
		});
	});

	it("sets status to 404 if route was not round", function(done){
		this.render("/invalid/route").then(function(result){
			var state = result.state;
			var printsMessage = /Not found/;

			assert.ok(hasError.test(result.html), 'error message is showing');
			assert.ok(printsMessage.test(result.html), 'Error message is showing on the page');
			assert.equal(state.attr("statusCode"), 404);
			assert.equal(state.attr("statusMessage"), "Not found");
		}).then(done);
	});

	it("renders html5 conditional comment", function(done){
		this.render("/orders").then(function(result){
			assert.ok(/<!--\[if lt IE 9\]>/.test(result.html), "beginning comment added");
			assert.ok(/\/scripts\/html5shiv\.min\.js/.test(result.html), "contains the correct path to html5shiv");
			assert.ok(/<!\[endif\]-->/.test(result.html), "ending comment added");

			assert.ok(/html5\.elements = "can-import order-history"/.test(result.html), "Custom tags added to shim the document");

		}).then(done);
	});
});
