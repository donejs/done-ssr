var Zone = require("can-zone");
var requests = require("./requests");
var dom = require("./can-simple-dom");
var pushFetch = require("./push-fetch");
var pushImages = require("./push-images");

var http = require("http");
var Writable = require("stream").Writable;

var server = http.createServer(function(req, res){
	res.end(JSON.stringify(["eat", "sleep"]));
}).listen(8070);

server.on("listening", function(){
	var request = new http.IncomingMessage();
	request.url = "/";
	request.protocol = "http";
	request.get = name => "localhost:8070";

	var response = {
		push: function(url, opts){
			var pushes = zone.data.pushes || (zone.data.pushes = []);
			var push = [url, opts, []];
			pushes.push(push);
			return new Writable({
				write: function(data, enc, next){
					push[2].push(data.toString());
					next();
				}
			});
		}
	};

	// TODO make this be a mocha test.

	var main = require("./tests/basics/main");

	var zone = new Zone({
		plugins: [
			// Overrides XHR, fetch
			requests(request),

			// Sets up a DOM
			dom(request),

			pushFetch(response),
			pushImages(response)
		]
	});

	zone.run(main)
	.then(data => {
		console.log(data.html);
		console.log(JSON.stringify(data.pushes, null, " "));
	})
	.catch(console.error.bind(console))
	.then(function(){
		server.close();
	});
});
