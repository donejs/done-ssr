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
			main: "define-map/index.stache!done-autorender"
		});
	});

	it("Returns a response", function(done){
		var response = through(function(buffer){
			var html = buffer.toString();
			var node = helpers.dom(html);

			var worked = node.getElementById("worked");

			Promise.resolve().then(function(){
				assert.equal(response.statusCode, 200, "Correct response");
				assert.ok(worked, "rendered the page");
			})
			.then(done, done);

		});
		this.render("/test").pipe(response);
	});

	it("Returns a 404 when there is no matching route", function(done){
		var response = through(function(){
			Promise.resolve().then(function(){
				var statusCode = response.statusCode;
				assert.equal(statusCode, 404, "Got a 404");
			}).then(done, done);
		});
		this.render("/test/ing").pipe(response);
	});
});
