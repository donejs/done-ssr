var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var iterate = require("leakage").iterate;
var path = require("path");
var through = require("through2");

describe("Memory leaks", function(){
	this.timeout(10000);

	before(function(){
		this.oldXHR = global.XMLHttpRequest;
		global.XMLHttpRequest = helpers.mockXHR(
			'[ { "a": "a" }, { "b": "b" } ]');

		var render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		});

		this.render = function(pth){
			return new Promise(function(resolve, reject){
				var stream = through(function(buffer){
					resolve(buffer);
				});
				stream.on("error", reject);
				render(pth).pipe(stream);
			});
		};
	});

	after(function(){
		global.XMLHttpRequest = this.oldXHR;
	});

	it("do not happen", function(done){
		iterate(10, () => {
			return this.render("/");
		})
		.then(() => {
			done();
		})
		.catch(done);
	});
});
