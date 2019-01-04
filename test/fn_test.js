var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var through = require("through2");

describe("fn main", function(){
	this.timeout(10000);

	before(function(){
		function render() {
			var el = document.createElement("main");
			document.body.appendChild(el);
		}

		this.render = ssr(render);
	});

	it("basics works", function(done){
		var renderStream = this.render("/");

		renderStream.on("error", done);

		renderStream.pipe(through(function(buffer){
			Promise.resolve().then(function(){
				var html = buffer.toString();
				var node = helpers.dom(html);
				var main = node.getElementsByTagName("main")[0];

				assert.ok(main, "The app was rendered from the provided fn");
			})
			.then(done, done);
		}));
	});
});
