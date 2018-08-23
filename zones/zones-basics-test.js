var Zone = require("can-zone");
var requests = require("./requests");
var dom = require("./can-simple-dom");
var pushFetch = require("./push-fetch");
var pushImages = require("./push-images");
var pushXHR = require("./push-xhr");

var assert = require("assert");
var {
	createServer,
	h2Headers,
	H2Stream
} = require("./test-helpers");
var helpers = require("../test/helpers");
var main = require("./tests/basics/main");

var spinUpServer = function(cb){
	return createServer(8070, function(req, res){
		var data;
		switch(req.url) {
			case "/api/todos":
				data = ["eat", "sleep"];
				break;
			case "/api/cart":
				data = { count: 22 };
				break;
		}
		res.end(JSON.stringify(data));
	})
	.then(server => {
		return cb().then(() => server.close());
	});
};

describe("SSR Zones - Basics", function(){
	describe("An app using fetch and PUSH", function(){
		before(function(){
			return spinUpServer(() => {
				var headers = h2Headers();
				var stream = this.stream = new H2Stream();

				var zone = this.zone = new Zone({
					plugins: [
						// Overrides XHR, fetch
						requests(headers),

						// Sets up a DOM
						dom(headers),

						pushFetch(stream),
						pushImages(stream, __dirname + "/tests/basics"),
						pushXHR(stream)
					]
				});

				return zone.run(main);
			});
		});

		it("Includes the right HTML", function(){
			assert(this.zone.data.html);
			var dom = helpers.dom(this.zone.data.html);
			var ul = helpers.find(dom, node => node.nodeName === "UL");

			var first = ul.firstChild.firstChild.nodeValue;
			var second = ul.firstChild.nextSibling.firstChild.nodeValue;

			assert.equal(first, "eat", "got the first li");
			assert.equal(second, "sleep", "got the second li");

			var cart = helpers.find(dom, node => node.getAttribute &&
				node.getAttribute("id") === "cart");
			assert.equal(cart.firstChild.nodeValue, "Count: 22", "XHR works");

			var globalDiv = helpers.find(dom, node => node.getAttribute &&
				node.getAttribute("id") === "the-global");
			assert.equal(globalDiv.firstChild.nodeValue, "true", "The window is the global object");

			var statusSpan = helpers.find(dom, node => node.className === "status");
			assert.equal(statusSpan.textContent, "OK", "Supports response.ok");
		});

		it("Data from the fetch requests was pushed", function(){
			var pushes = this.stream.data.pushes;
			var [headers, opts, data] = pushes.filter(p => p[0][":path"] === "/api/todos")[0];

			assert.equal(headers[":path"], "/api/todos", "Todos api");

			var todos = JSON.parse(data[0].toString());
			assert.equal(todos[0], "eat");
			assert.equal(todos[1], "sleep");
		});

		it("Data from the XHR requests was pushed", function(){
			var pushes = this.stream.data.pushes;
			var [headers, opts, data] = pushes.filter(p => p[0][":path"] === "/api/cart")[0];

			assert.equal(headers[":path"], "/api/cart", "Cart api");

			var cart = JSON.parse(data[0].toString());
			assert.equal(cart.count, 22, "Have the cart!");
		});

		it("Images from the request were pushed", function(){
			var pushes = this.stream.data.pushes;
			var [headers, opts, data] = pushes[0];

			assert.equal(headers[":path"], "/images/cat.png");
			assert.ok(data.length, "Got the data too");
		});
	});
});
