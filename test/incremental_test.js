var ssr = require("../lib/");
var helpers = require("./helpers");
var incHelpers = require("./inc_helpers");
var assert = require("assert");
var path = require("path");
var MutationDecoder = require("done-mutation/decoder");

describe("Incremental rendering", function(){
	this.timeout(10000);

	// Hack because can-view-parse can't parse attributes that contain HTML.
	helpers.preventWeirdSrcDocBug();

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

	describe("A basic async app", function(){
		before(function(done){
			var {
				headers,
				stream,
				result,
				complete
			} = incHelpers.mock("/", 2);

			this.result = result;
			var outStream = this.render(headers);
			outStream.pipe(stream);

			// Complete is a promise that resolves when rendering is done
			complete.then(done);
		});

		it("Sends the correct rendering instructions", function(){
			var doc = helpers.dom(this.result.html).ownerDocument;
			var decoder = new MutationDecoder(doc);
			var chunks = this.result.pushes[0][2];
			var insert = Array.from(decoder.decode(chunks[1]))[2];

			assert.equal(insert.type, "insert", "an insert");
			assert.equal(insert.node.nodeName, "ORDER-HISTORY", "adds the order-history component");
		});

		it("Includes the incremental rendering iframe", function(){
			var dom = helpers.dom(this.result.html);
			var iframe = helpers.find(dom, function(el){
				return el.nodeName === "IFRAME" &&
					el.getAttribute("id") === "donessr-iframe";
			});

			assert.ok(iframe, "Incremental rendering iframe included.");
		});

		it("Includes the styles as part of the initial HTML", function(){
			var dom = helpers.dom(this.result.html);
			var style = helpers.find(dom, function(el){
				return el.nodeName === "STYLE";
			});

			assert.ok(style, "Some styles were included");
		});
	});
});
