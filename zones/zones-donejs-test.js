var Zone = require("can-zone");
var path = require("path");
var requests = require("./requests");
var dom = require("./can-simple-dom");
var donejs = require("./donejs");

var assert = require("assert");
var {
	createServer,
	Request,
	Response
} = require("./test-helpers");
var helpers = require("../test/helpers");
var main = require("./tests/basics/main");

var spinUpServer = function(cb){
	return createServer(8070, function(req, res){
		switch(req.url) {
			case "/bar":
				var data = [ { "a": "a" }, { "b": "b" } ];
				break;
			default:
				throw new Error("No route for " + req.url);
		}
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));
	})
	.then(server => {
		return cb().then(() => server.close());
	});
};

describe("SSR Zones - DoneJS application", function(){
	this.timeout(10000);

	describe("An app that implements statusCode", function(){
		before(function(){
			function runRequest() {
				var request = new Request("/orders");
				var response = this.response = new Response();

				var zone = this.zone = new Zone({
					plugins: [
						requests(request),

						// Sets up a DOM
						dom(request),

						donejs({
							config: __dirname + "/../test/tests/package.json!npm",
							main: "async/index.stache!done-autorender"
						}, response)
					]
				});

				return zone.run();
			}

			return spinUpServer(() => {
				return runRequest.call(this).then(() => {
					return runRequest.call(this);
				});
			});
		});

		it("Includes the right HTML", function(){
			assert(this.zone.data.html);
			var node = helpers.dom(this.zone.data.html);

			var message = node.getElementById("orders");

			assert(message, "Found the message element that was rendered" +
				   "asynchronously");

			var cache = helpers.getXhrCache(node);

			assert.equal(cache.length, 1, "There is one item in cache");
			assert.equal(cache[0].request.url, "http://localhost:8070/bar", "correct request url");

			var resp = cache[0].response;

			var ct = resp.headers.split("\n")[0].trim();

			assert.equal(ct, "content-type: application/json",
						 "Header was added");
		});

		it("Includes the right number of styles", function(){
			assert(this.zone.data.html);
			var node = helpers.dom(this.zone.data.html);

			var styles = node.getElementsByTagName("style");
			assert.equal(styles.length, 2, "2 styles are included");
		});
	});

	describe("An app that doesn\'t implement statusCode", function(){
		before(function(){
			function runRequest() {
				var request = new Request("/home");
				var response = this.response = new Response();

				var zone = this.zone = new Zone({
					plugins: [
						requests(request),

						// Sets up a DOM
						dom(request),

						donejs({
							config: __dirname + "/../test/tests/package.json!npm",
							main: "progressive/index.stache!done-autorender"
						}, response)
					]
				});

				return zone.run();
			}

			return spinUpServer(() => {
				return runRequest.call(this).then(() => {
					return runRequest.call(this);
				});
			});
		});

		it("Has the right statusCode", function(){
			assert.equal(this.response.statusCode, 200);
		});
	})

	describe("An app that removes the document.head", function(){
		before(function(){
			function runRequest() {
				var request = new Request("/orders?removeHead=true");
				var response = this.response = new Response();

				var zone = this.zone = new Zone({
					plugins: [
						requests(request),

						// Sets up a DOM
						dom(request),

						donejs({
							config: __dirname + "/../test/tests/package.json!npm",
							main: "async/index.stache!done-autorender"
						}, response)
					]
				});

				return zone.run();
			}

			return spinUpServer(() => {
				return runRequest.call(this).then(() => {
					return runRequest.call(this);
				});
			});
		});

		it("Is able to render", function(){
			assert.ok(true, "Was able to render");
		});
	});

});
