var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Timeouts", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "timeout/index.stache!done-autorender"
		});
	});

	it("App times out after the specified time", function(done){
		this.render("/slow").pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			var result = node.getElementById("result").innerHTML;

			assert.equal(result, "passed", "Timed out");
			done();
		}));
	});
});
