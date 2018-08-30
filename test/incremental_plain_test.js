var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var Writable = require("stream").Writable;
var through = require("through2");
var noop = Function.prototype;
var path = require("path");

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
			var result = this.result = {
				html: null,
				instructions: []
			};

			var request = {
				url: "/",
				connection: {},
				headers: {
					host: "localhost",
					"user-agent": helpers.ua.chrome
				}
			};

			var response = through(function(buffer, enc, done){
				result.html = buffer.toString();
			});
			response.writeHead = noop;

			function instructions() {
				var writable = new Writable({
					write(chunk, enc, next) {
						result.instructions.push(chunk);
						next();
					}
				});

				var end = writable.end;
				writable.end = function(){
					done();
					return end.apply(this, arguments);
				};

				return writable;
			}

			response.push = function(){
				return instructions();
			};

			this.render(request).pipe(response);
		});

		it.skip("Sends back rendering instructions", function(){
			var instrs = this.result.instructions[0];
			assert.ok(instrs.length > 0, "Some instructions were returned");
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
