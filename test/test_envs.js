var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var through = require("through2");

describe("rendering an app using envs", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: __dirname + "/tests/package.json!npm",
			main: "envs/index.stache!done-autorender",
			env: "someenv"
		});
	}, {
		strategy: 'safe',
	});

	it("works", function(done){
		this.render("/").pipe(through(function(buffer){
			var node = helpers.dom(buffer.toString());

			var found = [];
			helpers.traverse(node, function(el){
				if(el.nodeName === "SPAN") {
					found.push(el);
				}
			});

			assert.equal(found[0].innerHTML, "hello bar",
						 "envs config was applied");
			done();
		}));
	});

});
