var assert = require("assert");
var ssr = require("../lib/index");
var helpers = require("./helpers");
var path = require("path");
var through = require("through2");

describe("An app not using jQuery", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "no-jquery/src/foo"
		});
	});

	it("Is able to render", function(done){
		this.render("/").pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			var msg = node.getElementById("msg");

			assert.equal(msg.firstChild.nodeValue, "Hello World", "It rendered");
			done();
		}));
	});
});
