var path = require("path");
var assert = require("assert");
var ssr = require("../lib/");
var helpers = require("./helpers");
var through = require("through2");

describe("xhr async rendering", function() {
	this.timeout(10000);

	var render;

	before(function() {
		this.oldXHR = global.XMLHttpRequest;
		global.XMLHttpRequest = helpers.mockXHR('[1,2,3,4,5]');

		render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "xhr/index.stache!done-autorender"
		});
	});

	after(function() {
		global.XMLHttpRequest = this.oldXHR;
	});

	it("works", function(done) {
		var stream = render("/");

		stream.pipe(through(function(buffer) {
			var node = helpers.dom(buffer.toString());
			var listItems = node.getElementsByTagName('li');

			assert.equal(listItems.length, 5, 'there should be 5 items');
			done();
		}));
	});
});
