var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");
var simpleDOM = require("../zones/can-simple-dom");

describe("Providing additional zones", function(){
	this.timeout(10000);

	before(function(done){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		}, {
			strategy: "seo",
			zones: [
				function(data) {
					return {
						afterStealMain: function() {
							data.addMe();
							var doc = data.document;
							var span = doc.createElement("span");
							span.setAttribute("id", "from-zone");
							doc.body.appendChild(span);
						}
					};
				}
			],
			domZone: function(request) {
				return function(data) {
					data.addMe = function() {
						var doc = data.document;
						var span = doc.createElement("span");
						span.setAttribute("id", "dom-zone");
						doc.body.appendChild(span);
					};

					return {
						plugins: [
							simpleDOM(request)
						]
					};
				};
			}
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

	it("Uses the additional zones", function(done) {
		var renderStream = this.render("/");

		renderStream.on("error", done);

		renderStream.pipe(through(function(buffer){
			Promise.resolve().then(function(){
				var html = buffer.toString();
				var node = helpers.dom(html);

				var span = helpers.find(node, function(n){
					return n.getAttribute && n.getAttribute("id") === "from-zone";
				});

				assert.ok(span, "Rendered a span that was added by another zone");
				done();
			})
			.catch(done);
		}));
	});

	it("Uses the domZone for applying the DOM zone.", function(done) {
		var renderStream = this.render("/");

		renderStream.on("error", done);

		renderStream.pipe(through(function(buffer){
			Promise.resolve().then(function(){
				var html = buffer.toString();
				var node = helpers.dom(html);

				var span = helpers.find(node, function(n){
					return n.getAttribute && n.getAttribute("id") === "dom-zone";
				});

				assert.ok(span, "Rendered a span that was added by the dom zone");
				done();
			})
			.catch(done);
		}));
	});
});
