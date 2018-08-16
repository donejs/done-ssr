/* jshint esversion: 6 */
var ssr = require("../lib/");
var helpers = require("./helpers");
var iterate = require("leakage").iterate;
var path = require("path");
var through = require("through2");

describe("Memory leaks", function(){
	this.timeout(30000);

	before(function(done){
		helpers.createServer(8070, function(req, res){
			var data;
			switch(req.url) {
				case "/bar":
					data = [ { "a": "a" }, { "b": "b" } ];
					break;
				default:
					throw new Error("No route for " + req.url);
			}
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(data));
		})
		.then(server => {
			this.server = server;

			// Render once so that everything is loaded
			this.render("/").then(_ => done());
		});

		var render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		});

		this.render = function(pth){
			return new Promise(function(resolve, reject){
				var stream = through(function(buffer){
					setTimeout(() => resolve(buffer), 300);
				});
				stream.on("error", reject);
				render(pth).pipe(stream);
			});
		};
	});

	after(function(){
		this.server.close();
	});

	it("No leaks occur after 10 iterations", function(done){
		var debug = typeof process.env.DONE_SSR_DEBUG !== "undefined";
		var cnt = 0;
		iterate(10, () => {
			cnt++;
			var thisIteration = cnt;
			if(debug) {
				console.error("Before render", thisIteration);
			}

			return this.render("/").then(() => {
				if(debug) {
					console.error("After render", thisIteration);
				}
			});
		})
		.then(() => {
			done();
		})
		.catch(done);
	});
});
