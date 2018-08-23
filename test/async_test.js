var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("async rendering", function(){
	this.timeout(10000);

	before(function(done){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		});

		helpers.createServer(8070, function(req, res){
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
		})
		.then(server => {
			this.server = server;
			done();
		});
	});

	after(function(){
		this.server.close();
	});

	it("basics works", function(done){
		var renderStream = this.render("/");

		renderStream.on("error", done);

		renderStream.pipe(through(function(buffer){
			Promise.resolve().then(function(){
				var html = buffer.toString();
				var node = helpers.dom(html);

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

				var scriptInjected = message.getAttribute("class");
				assert.equal(scriptInjected, "&#x3E;&#x3C;/div&#x3E;&#x3C;script&#x3E;alert(&#x27;hi&#x27;)&#x3C;/script&#x3E;");
			})
			.then(done, done);
		}));
	});

	it("request language is used", function(done){
		var request = {
			url: "/",
			connection: {},
			headers: {
				"host": "localhost",
				"accept-language": "en-US"
			}
		};
		this.render(request).pipe(through(function(buffer){
			Promise.resolve().then(function(){
				var html = buffer.toString();
				var node = helpers.dom(html);

				node = helpers.find(node, function(n){
					return n.className === "language";
				});
				var txt = helpers.text(node);

				assert.equal(txt, "en-US", "used the accept-langauge header");
			}).then(done, done);
		}));
	});

	it("sets a 404 status for bad routes", function(done){
		var response = through(function(){
			Promise.resolve().then(function(){
				var statusCode = response.statusCode;
				assert.equal(statusCode, 404, "Got a 404");
			}).then(done, done);
		});

		var renderStream = this.render("/fake");
		renderStream.on("error", done);
		renderStream.pipe(response);
	});

	it("sets a 500 status when there are errors", function(done){
		var response = through(function(){
			assert.ok(false, "Should not have gotten here");
			done();
		});

		var renderStream = this.render("?showError=true");
		renderStream.pipe(response);
		renderStream.on("error", function(err){
			assert.ok(true, "Got an error");
			done();
		});
	});
});
