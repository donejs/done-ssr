var Zone = require("can-zone");
var requests = require("./requests");
var dom = require("./can-simple-dom");
var pushFetch = require("./push-fetch");
var pushImages = require("./push-images");
var pushMutations = require("./push-mutations");
var pushXHR = require("./push-xhr");
var donejs = require("./donejs");
var he = require("he");

var assert = require("assert");
var {
	createServer,
	Request,
	Response
} = require("./test-helpers");
var helpers = require("../test/helpers");
var main = require("./tests/basics/main");

var spinUpServer = function(cb){
	return createServer(8070, function(req, res){
		switch(req.url) {
			case "/api/todos":
				var data = ["eat", "sleep"];
				break;
			case "/api/cart":
				var data = { count: 22 };
				break;
			case "/bar":
				var data = [{name:"foo"}];
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
				var request = new Request();
				var response = this.response = new Response();

				var zone = this.zone = new Zone([
					// Overrides XHR, fetch
					requests(request),

					// Sets up a DOM
					dom(request),

					pushMutations(response)
				]);

				var runPromise = zone.run(main);
				zone.data.initialHTML = zone.data.html;
				return runPromise;
			});
		});

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

		it("Contains mutations", function(){
			var pushes = this.response.data.pushes;
			var liMutation = JSON.parse(pushes[0][2][0].toString());

			assert.equal(liMutation[1].type, "insert", "Inserting a li");
			assert.equal(liMutation[1].node[3], "LI", "Inserting a li");
		});
	});
});

describe("SSR Zones - Incremental Rendering with DoneJS", function(){
	this.timeout(10000);

	before(function(){
		return spinUpServer(() => {
			var request = new Request("/home");
			var response = this.response = new Response();

			var zone = this.zone = new Zone([
				// Sets up a DOM
				dom(request),

				donejs({
					config: __dirname + "/../test/tests/package.json!npm",
					main: "async/index.stache!done-autorender"
				}, response),

				pushMutations(response)
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
			node.hasAttribute("data-streamurl"));
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
		var pushes = this.response.data.pushes;
		var mutations = pushes[0][2];

		assert.equal(mutations.length, 1, "There was only 1 mutation");

		var homeAsyncText = mutations[0].toString();
		assert.ok(/hello async!/.test(homeAsyncText), "included the async action");
	});
});
