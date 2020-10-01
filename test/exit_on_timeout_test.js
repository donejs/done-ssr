var ssr = require("../lib");
var helpers = require("./helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Exit on timeout", function(){
	this.timeout(30000);
	var undo,
		originalProcessExit;

	before(function(done){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "timeout/index.stache!done-autorender"
		}, {
			strategy: "safe",
			timeout: 100,
			debug: true,
			exitOnTimeout: true
		});

		// Do a warm-up so steal is loaded
		undo = helpers.willError(/was exceeded/);
		this.render("/fast").pipe(through(function(){
			setTimeout(function(){
				undo();
				done();
			}, 10000);
		}));
		
		originalProcessExit = process.exit;
		process.exit = function(code) {
			assert.ok('called');
			assert.equal(code, 1);
		};
	});

	after(function() {
		process.exit = originalProcessExit;
	});

	beforeEach(function() {
		undo = helpers.willError(/was exceeded/);
	});

	afterEach(function() {
		undo();
	});

	it("It exists with code 1 on timeout", function(done){ 
		this.render("/slow").pipe(through(function(){
			undo();
			Promise.resolve()
			.then(done, done);
		}));
	});
});
