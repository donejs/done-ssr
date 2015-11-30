var path = require("path");
var canSsr = require("../lib/");
var assert = require("assert");

describe("In a project using leakScope false", function(){
	before(function(){
		this.render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "leakscope/index.stache!done-autorender",
		});
	});

	it("works", function(){
		return this.render("/").then(function(result){
			assert(/<h1>child<\/h1>/.test(result.html), "it should renders child's template");
		});
	});
});
