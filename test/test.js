var canSsr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");

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
		this.render("/").then(function(html){
			var node = helpers.dom(html);

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
		this.render("/orders").then(function(html){
			var node = helpers.dom(html);

			var found = {};
			helpers.traverse(node, function(el){
				if(el.nodeName === "STYLE" || el.nodeName === "SCRIPT") {
					found[el.getAttribute("asset-id")] = true;
				}
			});

			assert.equal(found["progressive/main.css!$css"], true, "Found the main css");
			assert.equal(found["progressive/orders/orders.css!$css"], true, "Found the orders bundle css");
			assert.equal(found["@inline-cache"], true, "The inline-cache was registered");


		}).then(done);
	});
});
