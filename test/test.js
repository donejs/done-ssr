var stealServerSideRender = require("../lib/main");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");

describe("steal-server-side-render", function(){
	var render = stealServerSideRender({
		config: __dirname + "/tests/package.json!npm",
		main: "progressive/index.stache!",
		paths: {
			"$css": path.resolve(__dirname + "/tests/less_plugin.js")
		}
	});


	it("basics works", function(done){
		render("/").then(function(html){
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
		render("/orders").then(function(html){
			var node = helpers.dom(html);

			var found = {};
			helpers.traverse(node, function(el){
				if(el.nodeName === "STYLE" || el.nodeName === "SCRIPT") {
					found[el.getAttribute("can-asset-id")] = true;
				}
			});

			assert.equal(found["progressive/main.css!$css"], true, "Found the main css");
			assert.equal(found["progressive/orders/orders.css!$css"], true, "Found the orders bundle css");
			assert.equal(found["@inline-cache"], true, "The inline-cache was registered");


		}).then(done);
	});
});
