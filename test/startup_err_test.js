var ssr = require("../lib/");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Error during steal.startup()", function(){
	this.timeout(10000);
	var unhandledErr;

	function onUnhandledRejection(err) {
		unhandledErr = err;
	}

	before(function(){
		process.on("unhandledRejection", onUnhandledRejection);

		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "startup_err/index.stache!done-autorender",
			configDependencies: ["live-reload"]
		});
	});

	after(function(){
		process.removeListener("unhandledRejection", onUnhandledRejection);
	});

	it("Emits an error event", function(done){
		var renderStream = this.render("/");
		renderStream.pipe(through(function(){
			done(new Error("Should not have rendered"));
		}));

		renderStream.on("error", function(err){
			assert(/foo is not defined/.test(err.message), "Got the right error");
			done();
		});
	});

	it("Does not cause an unhandledRejection", function(){
		assert.equal(unhandledErr, undefined, "Did not get an unhandled rejection");
	});
});
