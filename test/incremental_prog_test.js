var ssr = require("../lib/");
var helpers = require("./helpers");
var incHelpers = require("./inc_helpers");
var assert = require("assert");
var path = require("path");
var createXHR = require("../lib/polyfills/xhr");

describe("Incremental rendering", function(){
	this.timeout(10000);

	before(function(){
		this.oldXHR = global.XMLHttpRequest;
		var MockXHR = helpers.mockXHR(
			'[ { "a": "a" }, { "b": "b" } ]');
		global.XMLHttpRequest = createXHR(function(){
			MockXHR.apply(this, arguments);
			this.open = MockXHR.prototype.open.bind(this);
			this.send = MockXHR.prototype.send.bind(this);
		});

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

	describe("A progressively loaded page", function(){
		before(function(done){
			var {
				request,
				response,
				result,
				complete
			} = incHelpers.mock("/orders", 2);

			this.result = result;
			this.render(request).pipe(response);

			complete.then(done);
		});

		it("Pushed a mutation to insert styles", function(){
			var instr = this.result.instructions[0][0];
			assert.equal(instr.type, "insert", "Inserting an element");
			assert.equal(instr.node[3], "STYLE", "Inserting a style tag");
		});
	});
});
