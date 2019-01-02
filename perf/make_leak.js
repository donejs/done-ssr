var ssr = require("../lib/");
var helpers = require("../test/helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

async function run() {
	let server = await helpers.createServer(8070, function(req, res){
		var data;
		switch(req.url) {
			case "/bar":
				data = [ { "a": "a" }, { "b": "b" } ];
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(data));
				break;
			default:
				throw new Error("No route for " + req.url);
		}
	});


	var render = ssr({
		config: "file:" + path.join(__dirname, "..", "test", "tests", "package.json!npm"),
		main: "async/index.stache!done-autorender"
	});

	var renderThen = function(pth){
		return new Promise(function(resolve, reject){
			var stream = through(function(buffer){
				resolve(buffer);
			});
			stream.on("error", reject);
			render(pth).pipe(stream);
		});
	};

	var i = 100;
	next();

	function next() {
		if(i === 0) {
			server.close();
			return;
		}

		i--;
		renderThen("/").then(next);
	}
}

run();
