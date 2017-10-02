var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Projects importing a component that doesn't exist", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "import-empty/index.stache!done-autorender"
		});
	});

	it("finishes rendering", function(done){
		var renderStream = this.render("/");

		renderStream.pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			console.log(html);

			var rej = helpers.find(node, function(el){
				return el.getAttribute && el.getAttribute("id") === "rejected";
			});

			assert(rej, "Showing the rejected element");
			done();
		}));
	});
});
