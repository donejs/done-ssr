var ssr = require("../lib/");
var helpers = require("./helpers");
var incHelpers = require("./inc_helpers");
var http = require("http");
var assert = require("assert");
var path = require("path");
var MutationDecoder = require("done-mutation/decoder");
var URL = require("url").URL;

describe("Incremental rendering with HTTP/1", function(){
	this.timeout(10000);

	before(async function(){
		this.apiServer = await helpers.serveAPI();
		this.server = await helpers.createServer(8071, (req, res) => {
			this.render(req).pipe(res);
		});

		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		}, {
			strategy: "incremental"
		});
	});

	after(function(){
		this.apiServer.close();
		this.server.close();
	});

	describe("A basic async app", function(){
		before(async function(){
			this.htmlResponse = await helpers.makeRequest("http://localhost:8071/");
			var instrURL = helpers.extractInstructionsURL(this.htmlResponse.body);
			var endpoint = new URL(instrURL, "http://localhost:8071");
			this.mutationResponse = await helpers.makeRequest(endpoint.toString(), false);

			this.mutations = helpers.decodeMutations(this.mutationResponse.body);
		});

		it("Sends mutation instruction for order-history", function(){
			var oh = this.mutations[3];

			assert.equal(oh.type, "insert");
			assert.equal(oh.node.nodeName, "ORDER-HISTORY");
		});

		it("Includes the preload link in the iframe document", function(){
			var doc = helpers.extractIframeDoc(this.htmlResponse.body);
			var link = helpers.find(doc, function(node) {
				return node.getAttribute && node.getAttribute("rel") === "preload";
			});

			assert.ok(link, "Preload link exists");
			assert.equal(link.getAttribute("as"), "fetch", "has the correct 'as'");
			assert.equal(link.getAttribute("crossorigin"), "anonymous", "set as anonymous");
		});
	});
});
