var stealServerSideRender = require("../lib/main");
var helpers = require("./helpers");
var assert = require("assert");

describe("steal-server-side-render", function(){
	it("basics works", function(done){
		var render = stealServerSideRender({
			config: __dirname + "/tests/package.json!npm",
			main: "basics/index.stache!"
		});

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
});
