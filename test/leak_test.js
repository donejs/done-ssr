/* jshint esversion: 6 */
var ssr = require("../lib/");
var helpers = require("./helpers");
var iterate = require("leakage").iterate;
var path = require("path");
var through = require("through2");

describe("Memory leaks", function(){
	this.timeout(30000);

	before(function(done){
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
					setTimeout(resolve, 300);
				});
				stream.on("error", reject);
				render(pth).pipe(stream);
			});
		};

		// Render once so that everything is loaded
		this.render("/").then(_ => done());
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
