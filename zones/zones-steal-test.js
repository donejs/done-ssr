var Zone = require("can-zone");
var path = require("path");
var fetch = require("./requests/fetch");
var dom = require("./can-simple-dom");
var pushFetch = require("./push-fetch");
var pushImages = require("./push-images");
var pushXHR = require("./push-xhr");
var steal = require("./steal");

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
			case "/api/todos":
				var data = ["eat", "sleep"];
				break;
			case "/api/cart":
				var data = { count: 22 };
				break;
		}
		res.end(JSON.stringify(data));
	})
	.then(server => {
		return cb().then(() => server.close());
	});
};

describe("SSR Zones - Steal application", function(){
	this.timeout(10000);

	before(function(){
		return spinUpServer(() => {
			var request = new Request("/home");
			var response = this.response = new Response();

			var zone = this.zone = new Zone({
				plugins: [
					// Sets up a DOM
					dom(request),

					steal({
						config: __dirname + "/../test/tests/package.json!npm",
						main: "plain/main",
						paths: {
							"done-ssr/import": "file:" + path.resolve(__dirname + "/../import.js")
						}
					})
				]
			});

			return zone.run();
		});
	});

	it("Includes the right HTML", function(){
		assert(this.zone.data.html);
		var dom = helpers.dom(this.zone.data.html);
		var home = helpers.find(dom, node => node.getAttribute &&
			node.getAttribute("id") === "home");

		assert(home, "Got the 'home' div")

		assert.equal(home.firstChild.nodeValue, "You are home", "Rendered it");
	});
});

describe("SSR Zones - Steal application with main exec", function(){
	this.timeout(10000);

	before(function(){
		return spinUpServer(() => {
			var request = new Request("/home");
			var response = this.response = new Response();

			var zone = this.zone = new Zone({
				plugins: [
					// Sets up a DOM
					dom(request),

					steal({
						config: __dirname + "/../test/tests/package.json!npm",
						main: "reexec/main"
					})
				]
			});

			return zone.run();
		});
	});

	it("Includes the right HTML", function(){
		assert(this.zone.data.html);
		var dom = helpers.dom(this.zone.data.html);
		var body = dom.firstChild.nextSibling;

		var count = 0, node = body.firstChild;
		while(node) {
			if(node.className === "content") {
				count++;
			}
			node = node.nextSibling;
		}

		assert.equal(count, 1, ".content was rendered");
	});
});
