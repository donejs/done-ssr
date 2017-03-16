var assert = require("assert");
var helpers = require("./helpers");
var path = require("path");
var through = require("through2");

var ssr = require("../lib/index");

describe("Using can-define/map/map", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "define-map-status/index.stache!done-autorender"
		});
	});

	it("Returns a response", function(done){
		var response = through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			var worked = node.getElementById("worked");

			assert.ok(worked, "rendered the page");
			done();
		});
		this.render("/test").pipe(response);
	});

	it.only("Returns a 404 when there is no matching route", function(done){
		var response = through(function(){
			var statusCode = response.statusCode;
			assert.equal(statusCode, 404, "Got a 404");
			done();
		});
		this.render("/test/").pipe(response);
	});
});
