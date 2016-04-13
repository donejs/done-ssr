var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");
var	hasError = /Error:/;

describe("Server-Side Rendering Basics", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "progressive/index.stache!done-autorender",
			paths: {
				"$css": "file:" + path.resolve(__dirname + "/tests/less_plugin.js")
			}
		}, {
			html5shiv: true
		});
	});

	it("basics works", function(done){
		this.render("/").pipe(through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			var home = node.getElementById("home");
			assert.ok(home, "Found the 'home' element");

			var location = node.getElementById("location");
			assert.equal(location.innerHTML, "/", "Got the window.location");

			var docLocation = node.getElementById("doc-location");
			assert.equal(docLocation.innerHTML, "/", "Got the document.location");

			done();
		}));
	});

	it("works with progressively loaded bundles", function(done){
		var stream = this.render("/orders");

		var response = through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			var found = {};
			helpers.traverse(node, function(el){
				if(el.nodeName === "STYLE" || el.nodeName === "SCRIPT") {
					found[el.getAttribute("asset-id")] = true;
				}
			});

			assert.ok(!hasError.test(html), 'does not print an error message');
			assert.equal(response.statusCode, 200);
			assert.equal(found["progressive/main.css!$css"], true, "Found the main css");
			assert.equal(found["progressive/orders/orders.css!$css"], true, "Found the orders bundle css");

			var totalsEl = helpers.find(node, function(el){
				return el.getAttribute && el.getAttribute("id") === "totals";
			});
			assert.ok(totalsEl, "an element that was conditionally added in the 'inserted' event is rendered");

			done();
		});

		stream.pipe(response);
	});

	it("returns only the css needed for the request", function(done){
		var render = this.render;

		var checkCount = function(html, expected, message){
			var node = helpers.dom(html);

			var styles = helpers.count(node, function(el){
				return el.nodeName === "STYLE";
			});

			assert.equal(styles, expected, message + " | " + styles +
						 " !== " + expected);
		};

		render("/orders").pipe(through(function(buffer){
			checkCount(buffer.toString(), 2,
					   "There should be 2 styles for the orders page");

			render("/").pipe(through(function(buffer){
				checkCount(buffer.toString(), 1,
						   "There should only be 1 style for the root page");

				done();
			}));
		}));
	});

	it("sets status to 404 if route was not round", function(done){
		var stream = this.render("/invalid/route");

		var response = through(function(buffer){
			var html = buffer.toString();
			var printsMessage = /Not found/;

			assert.ok(hasError.test(html), 'error message is showing');
			assert.ok(printsMessage.test(html),
					  'Error message is showing on the page');
			assert.equal(response.statusCode, 404);
			done();
		});

		stream.pipe(response);
	});

	it("renders html5 conditional comment", function(done){
		this.render("/orders").pipe(through(function(buffer){
			var html = buffer.toString();
			assert.ok(/<!--\[if lt IE 9\]>/.test(html),
					  "beginning comment added");
			assert.ok(/\/scripts\/html5shiv\.min\.js/.test(html),
					  "contains the correct path to html5shiv");
			assert.ok(/<!\[endif\]-->/.test(html), "ending comment added");

			assert.ok(/html5\.elements = "can-import order-history"/.test(html),
					  "Custom tags added to shim the document");

			done();
		}));
	});
});
