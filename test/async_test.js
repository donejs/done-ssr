var canSsr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("async rendering", function(){
	before(function(){
		this.oldXHR = global.XMLHttpRequest;

		var XHR = global.XMLHttpRequest = function(){
			this.onload = null;
		};
		var realSetTimeout = global.setTimeout;
		XHR.prototype.open = function(){};
		XHR.prototype.send = function(){
			var onload = this.onload;
			var xhr = this;
			realSetTimeout(function(){
				xhr.responseText = '[ { "a": "a" }, { "b": "b" } ]';
				onload({ target: xhr });
			}, 40);
		};
		XHR.prototype.getAllResponseHeaders = function(){
			return "Content-Type: application/json";
		};

		this.render = canSsr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender",
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js")
			}
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
});
