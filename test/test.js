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

	it("dep-cache asset works", function(done){
		this.render("/").then(function(result){
			var node = helpers.dom(result.html);

			var found;
			helpers.traverse(node, function(el){
				if(el.nodeName === "SCRIPT" && el.getAttribute
				   && el.getAttribute("asset-id") === "@dep-cache") {
					found = el;
				}
			});

			assert(!!found, "Found the dep-cache asset");

			var content = helpers.text(found).trim();
			assert(/System\.depCache/.test(content), "depCache added to the page");
			assert(/progressive\/index\.stache/.test(content), "System.main was included");

		}).then(done);
	});

});
