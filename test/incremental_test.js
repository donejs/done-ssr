var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var Writable = require("stream").Writable;
var through = require("through2");
var noop = Function.prototype;
var chromeUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.109 Safari/537.36";

describe("Incremental rendering", function(){
	this.timeout(10000);

	before(function(){
		this.oldXHR = global.XMLHttpRequest;
		global.XMLHttpRequest = helpers.mockXHR(
			'[ { "a": "a" }, { "b": "b" } ]');

		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		}, {
			strategy: "incremental"
		});
	});

	after(function(){
		global.XMLHttpRequest = this.oldXHR;
	});

	it("Sends the correct rendering instructions", function(done){
		var request = {
			url: "/",
			headers: {
				"user-agent": chromeUA
			}
		};

		var response = through(noop);
		response.writeHead = noop;
		response.push = function(){
			var count = 0;
			return new Writable({
				write(chunk, enc, next) {
					var json = chunk.toString();
					var instrs = JSON.parse(json);

					if(++count === 1) {
						var instr = instrs[4];
						var route = instr.route;
						assert.equal(route, "0.2.5");
					} else {
						// TODO test this one maybe
						done();
					}
					next();
				}
			});
		};

		this.render(request).pipe(response);
	});
});
