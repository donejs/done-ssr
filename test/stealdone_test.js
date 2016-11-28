var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Using steal.done() in a module", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "stealdone/main"
		});
	});

	it("returns a Promise", function(done){
		var render = this.render;

		var stream = render("/");
		stream.on("error", done);

		stream.pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);
			console.log(html);

			var tn = helpers.find(node, function(node){
				return node.nodeType === 3;
			});

			assert.equal(tn.nodeValue, "object");
			done();
		}));
	});
});
