var path = require("path");
var ssr = require("../lib/");
var assert = require("assert");
var through = require("through2");

describe("In a project using leakScope false", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
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
