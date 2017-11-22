var ssr = require("../lib/");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Timeouts", function(){
	this.timeout(30000);

	before(function(done){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "timeout/index.stache!done-autorender"
		}, {
			timeout: 100,
			debug: true
		});

		// Do a warm-up so steal is loaded
		this.render("/fast").pipe(through(function(){
			setTimeout(function(){
				done();
			}, 10000);
		}));
	});

	it("App times out after the specified time", function(done){
		this.render("/slow").pipe(through(function(buffer){
			Promise.resolve().then(function(){
				var html = buffer.toString();
				var node = helpers.dom(html);

				var result = node.getElementById("result").innerHTML;

				assert.equal(result, "failed", "Timed out");
			}).then(done, done);
		}));
	});

	it("Doesn't timeout if rendered quickly enough", function(done){
		this.render("/fast").pipe(through(function(buffer){
			Promise.resolve().then(function(){
				var html = buffer.toString();
				var node = helpers.dom(html);

				var result = node.getElementById("result").innerHTML;
				assert.equal(result, "passed", "Timed out");

				var debug = node.getElementById("done-ssr-debug");
				assert.ok(!debug, "debug node not present");
			})
			.then(done, done);
		}));
	});

	it("Includes stack trace info when timing out", function(done){
		this.render("/slow").pipe(through(function(buffer){
			var html = buffer.toString();

			assert.ok(/done-ssr-debug/.test(html), "got the debug node");
			assert.ok(/setTimeout/.test(html),
					  "Includes the task name that failed");

			done();
		}));
	});
});
