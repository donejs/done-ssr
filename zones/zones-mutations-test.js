var Zone = require("can-zone");
var requests = require("./requests");
var dom = require("./can-simple-dom");
var pushFetch = require("./push-fetch");
var pushImages = require("./push-images");
var pushMutations = require("./push-mutations");
var pushXHR = require("./push-xhr");
var donejs = require("./donejs");
var he = require("he");
require('fast-text-encoding');
var MutationDecoder = require("done-mutation/decoder");

var assert = require("assert");
var {
	createServer,
	h2Headers,
	H2Stream
} = require("./test-helpers");
var helpers = require("../test/helpers");
var main = require("./tests/basics/main");

var spinUpServer = function(cb){
	return createServer(8070, function(req, res){
		var data;
		switch(req.url) {
			case "/api/todos":
				data = ["eat", "sleep"];
				break;
			case "/api/cart":
				data = { count: 22 };
				break;
			case "/bar":
				data = [{name:"foo"}];
				break;
		}
		res.end(JSON.stringify(data));
	})
	.then(server => {
		return cb().then(() => server.close());
	});
};

describe("SSR Zones - Incremental Rendering", function(){
	describe("An app using fetch and PUSH", function(){
		before(function(){
			return spinUpServer(() => {
				var headers = h2Headers();
				var stream = this.stream = new H2Stream();

				var zone = this.zone = new Zone([
					// Overrides XHR, fetch
					requests(headers),

					// Sets up a DOM
					dom(headers),

					pushMutations(headers, stream),

					helpers.removeMutationObserverZone
				]);

				var runPromise = zone.run(main);
				zone.data.initialHTML = zone.data.html;
				return runPromise;
			});
		});

		after(function() {
			delete global.XMLHttpRequest;
		})

		it("Contains the correct initial HTML", function(){
			var dom = helpers.dom(this.zone.data.initialHTML);
			assert.equal(dom.getAttribute("data-incrementally-rendered"), "",
				"contains the flag that incrementally rendering is used");

			var iframe = helpers.find(dom, node => node.nodeName === "IFRAME");
			assert.equal(iframe.getAttribute("data-keep"), "",
				"the iframe contains the 'keep' attribute to prevent it from being removed");

			var ul = helpers.find(dom, node => node.nodeName === "UL");
			assert.ok(!ul.firstChild, "There are no child LIs yet");
		});

		it("iframe doc contains TextNode separators", function() {
			var dom = helpers.dom(this.zone.data.initialHTML);
			var iframe = helpers.find(dom, node => node.nodeName === "IFRAME");
			var html = helpers.decodeSrcDoc(iframe);
			var idom = helpers.dom(html);

			var comments = 0;
			helpers.traverse(idom, node => {
				if(node.nodeType === 8 && node.nodeValue === "__DONEJS-SEP__") {
					comments++;
				}
			});

			assert.ok(comments > 0, "There are some separator comment nodes");
		});

		it("Contains mutations", function(){
			var decoder = new MutationDecoder(this.zone.data.document);
			var pushes = this.stream.data.pushes;
			var mutations = pushes[0][2].map(buf => Array.from(decoder.decode(buf)));

			assert.equal(mutations[0][0].node.nodeValue, "OK", "Status change");
			assert.equal(mutations[1][0].node.nodeName, "LI", "Todo 1 added");
			assert.equal(mutations[1][1].node.nodeName, "LI", "Todo 2 added");
			assert.equal(mutations[2][0].node.nodeValue, "Count: 22", "Cart count updated");
		});
	});
});

describe("SSR Zones - Incremental Rendering with DoneJS", function(){
	this.timeout(10000);

	before(function(){
		return spinUpServer(() => {
			var headers = h2Headers();
			var stream = this.stream = new H2Stream();

			var zone = this.zone = new Zone([
				// Overrides XHR, fetch
				requests(headers),

				// Sets up a DOM
				dom(headers),

				donejs({
					config: __dirname + "/../test/tests/package.json!npm",
					main: "async/index.stache!done-autorender"
				}, stream),

				pushMutations(headers, stream),
				helpers.removeMutationObserverZone
			]);

			var runPromise = zone.run();
			return zone.data.initialStylesLoaded.then(function(){
				zone.data.initialHTML = zone.data.html;
				return runPromise;
			});
		});
	});

	it("reattachment script is within the <head>", function(){
		var dom = helpers.dom(this.zone.data.initialHTML);
		var iframe = helpers.find(dom, node => node.nodeName === "IFRAME");

		var html = helpers.decodeSrcDoc(iframe);
		var idom = helpers.dom(html);

		var reattach = helpers.find(idom, node => node.nodeType === 1 &&
			node.getAttribute("type") === "module");
		var parent = reattach.parentNode;

		assert.equal(parent.nodeName, "HEAD", "within the head");
	});

	it("iframe overlay contains styles", function(){
		var dom = helpers.dom(this.zone.data.initialHTML);
		var iframe = helpers.find(dom, node => node.nodeName === "IFRAME");
		var html = helpers.decodeSrcDoc(iframe);
		var idom = helpers.dom(html);

		var style = helpers.find(idom, node => node.nodeName === "STYLE");

		assert.ok(style, "there was style here");
	});

	it("contains the right instructions", function(){
		var decoder = new MutationDecoder(this.zone.data.document);
		var decoder = new MutationDecoder(this.zone.data.document);
		var pushes = this.stream.data.pushes;
		var mutations = pushes[0][2].map(buf => Array.from(decoder.decode(buf)));

		assert.equal(mutations.length, 3, "There were 3 mutations");
	});
});
