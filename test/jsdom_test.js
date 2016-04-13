var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var jsdom = require("jsdom").jsdom;
var path = require("path");
var through = require("through2");

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

		ssr.dom(function(){
			var doc = jsdom("<html><body></body></html>");
			return {
				document: doc,
				window: doc.defaultView
			};
		});
	});

	it("basics works", function(done){
		this.render("/").pipe(through(function(buffer){
			var html = buffer.toString();

			console.log("HTML:", html);

	/*		var node = helpers.dom(html);

			var foundHome = false;
			helpers.traverse(node, function(el){
				if(el.nodeName === "DIV" && el.getAttribute("id") === "home") {
					foundHome = true;
				}
			});

			assert.equal(foundHome, true, "Found the 'home' element");*/
			done();
		}));
	});
});
