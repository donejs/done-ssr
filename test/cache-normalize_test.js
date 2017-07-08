var assert = require("assert");
var path = require("path");
var through = require("through2");

var ssr = require("../lib/index");

describe("useCacheNormalize", function(){
	this.timeout(10000);

	describe("By default", function(){
		before(function(){
			this.render = ssr({
				config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
				main: "define/index.stache!done-autorender"
			});
		});

		it("cache is used", function(done){
			var loader = this.render.loader;
			var response = through(function(buffer){
				assert.ok("_normalizeCache" in loader, "The cache was added");

				done();
			});
			this.render("/").pipe(response);
		});
	});

	describe("When turned off", function(){
		before(function(){
			this.render = ssr({
				config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
				main: "define/index.stache!done-autorender"
			}, {
				useCacheNormalize: false
			});
		});

		it("cache is not used", function(done){
			var loader = this.render.loader;
			var response = through(function(buffer){
				assert.ok(!("_normalizeCache" in loader), "The cache was not added");

				done();
			});
			this.render("/").pipe(response);
		});
	});


});
