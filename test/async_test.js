var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("async rendering", function(){
	this.timeout(10000);

	before(function(){
		this.oldXHR = global.XMLHttpRequest;
		global.XMLHttpRequest = helpers.mockXHR(
			'[ { "a": "a" }, { "b": "b" } ]');

		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		});
	});

	after(function(){
		global.XMLHttpRequest = this.oldXHR;
	});

	it("basics works", function(done){
		this.render("/").pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			var message = node.getElementById("orders");

			assert(message, "Found the message element that was rendered" +
				   "asynchronously");

			var cache = helpers.getXhrCache(node);

			assert.equal(cache.length, 1, "There is one item in cache");
			assert.equal(cache[0].request.url, "foo://bar", "correct request url");

			var resp = cache[0].response;


			assert.equal(resp.headers, "Content-Type: application/json",
						 "Header was added");
			done();
		}));
	});

	it("request language is used", function(done){
		var request = {
			url: "/",
			headers: {
				"accept-language": "en-US"	
			}
		};
		this.render(request).pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			node = helpers.find(node, function(n){
				return n.className === "language";
			});
			var txt = helpers.text(node);

			assert.equal(txt, "en-US", "used the accept-langauge header");
			done();
		}));
	});

	it("sets a 404 status for bad routes", function(done){
		var response = through(function(){
			var statusCode = response.statusCode;
			assert.equal(statusCode, 404, "Got a 404");
			done();
		});

		this.render("/fake").pipe(response);
	});

	it.only("sets a 500 status when there are errors", function(done){
		var response = through(function(){
			console.log("WHAT:", response.statusCode);
			done();
		});

		this.render("?showError=true").pipe(response);
	});
});
