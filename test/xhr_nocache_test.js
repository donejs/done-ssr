var path = require("path");
var assert = require("assert");
var ssr = require("../lib/");
var helpers = require("./helpers");
var through = require("through2");

describe("options.xhrCache", function() {
	this.timeout(10000);

	var render;

	before(function(done) {
		render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "xhr/index.stache!done-autorender"
		}, {
			strategy: 'safe',
			xhrCache: false
		});

		helpers.createServer(8070, function(req, res){
			var data;
			switch(req.url) {
				case "/api/list":
					data = [1,2,3,4,5];
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

	after(function() {
		this.server.close();
	});

	it("'false' doesn't render the XHR_CACHE to HTML", function(done) {
		var stream = render("/");

		stream.pipe(through(function(buffer) {
			Promise.resolve().then(function(){
				var html = buffer.toString();
				var node = helpers.dom(html);
				var script = node.getElementsByTagName('script')[0];

				assert.ok(!script, "No script element because no XHR_CACHE");
				done();
			}).catch(done);

		}));
	});
});
