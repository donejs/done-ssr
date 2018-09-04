var ssr = require("../lib/");
var helpers = require("./helpers");
var incHelpers = require("./inc_helpers");
var assert = require("assert");
var path = require("path");
var MutationDecoder = require("done-mutation/decoder");

describe("Incremental rendering", function(){
	this.timeout(10000);

	before(function(done){
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

		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		}, {
			strategy: "incremental"
		});
	});

	after(function(){
		this.server.close();
	});

	describe("A progressively loaded page", function(){
		before(function(done){
			var {
				headers,
				stream,
				result,
				complete
			} = incHelpers.mock("/orders", 2);

			this.result = result;
			var outStream = this.render(headers);
			outStream.pipe(stream);

			// Complete is a promise that resolves when rendering is done
			complete.then(done);
		});

		it("Pushed a mutation to insert styles", function(){
			var doc = helpers.dom(this.result.html).ownerDocument;
			var decoder = new MutationDecoder(doc);
			var instrPushes = this.result.pushes[0][2];

			var insert = Array.from(decoder.decode(instrPushes[0]))[0];
			assert.equal(insert.type, "insert");
			assert.equal(insert.node.nodeName, "STYLE",
				"inserted the progressively loaded style");
		});
	});
});
