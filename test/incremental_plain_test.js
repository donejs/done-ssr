var ssr = require("../lib/");
var helpers = require("./helpers");
var incHelpers = require("./inc_helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");
var noop = Function.prototype;
var path = require("path");
var MutationDecoder = require("done-mutation/decoder");

describe("Incremental rendering - plain JS", function(){
	this.timeout(10000);
	helpers.preventWeirdSrcDocBug();

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "plain/main",
			paths: {
				"done-ssr/import": "file:" + path.resolve(__dirname + "/../import.js")
			}
		}, {
			strategy: "incremental"
		});
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

		it("Sends back rendering instructions", function(){
			var doc = helpers.dom(this.result.html).ownerDocument;
			var decoder = new MutationDecoder(doc);
			var instrPush = this.result.pushes[0][2];
			var insert = Array.from(decoder.decode(instrPush[0]))[1];
			assert.equal(insert.type, "insert");
			assert.equal(insert.node.nodeName, "HOME-PAGE");
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
