var ssr = require("../lib/");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("live-reload", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "lr/index.stache!done-autorender",
			liveReloadHost: "localhost",
			configDependencies: [
				"live-reload"
			]
		});
	});

	it("Initially works", function(done){
		var renderStream = this.render("/");
		renderStream.pipe(through(function(){
			assert.ok(true, "Rendered");
			done();
		}));
	});
});
