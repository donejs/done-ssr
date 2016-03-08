var path = require("path");
var canSsr = require("../lib/");
var assert = require("assert");
var through = require("through2");

describe("In a project using leakScope false", function(){
	before(function(){
		this.render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "leakscope/index.stache!done-autorender",
		});
	});

	it("works", function(done){
		this.render("/").pipe(through(function(buffer){
			var html = buffer.toString();
			assert(/<h1>child<\/h1>/.test(html),
				   "it should renders child's template");
			done();
		}));
	});
});
