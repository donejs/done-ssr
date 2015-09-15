var canSsr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");

describe("rendering an app using envs", function(){
	before(function(){
		this.render = canSsr({
			config: __dirname + "/tests/package.json!npm",
			main: "envs/index.stache!done-autorender",
			env: "someenv"
		});
	});

	it("works", function(done){
		this.render("/").then(function(result){
			var node = helpers.dom(result.html);

			var found = [];
			helpers.traverse(node, function(el){
				if(el.nodeName === "SPAN") {
					found.push(el);
				}
			});

			assert.equal(found[0].innerHTML, "hello bar", "envs config was applied");
		}).then(done);
	});

});
