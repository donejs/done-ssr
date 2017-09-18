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

	describe("A basic async app", function(){
		before(function(done){
			var {
				request,
				response,
				result,
				complete
			} = incHelpers.mock("/", 2);

			this.result = result;
			this.render(request).pipe(response);

			// Complete is a promise that resolves when rendering is done
			complete.then(done);
		});

		it("Sends the correct rendering instructions", function(){
			var instr = this.result.instructions[0][1];
			assert.equal(instr.route, "0.2.7");

			// Easier to test
			var nodeAsJson = JSON.stringify(instr.node);
			assert.ok(/ORDER-HISTORY/.test(nodeAsJson), "adds the order-history component");
		});

		it("Includes the styles as part of the initial HTML", function(){
			var dom = helpers.dom(this.result.html);
			// The script is the first element of the dom
			var doc = dom.nextSibling;
			var style = helpers.find(doc, function(el){
				return el.nodeName === "STYLE";
			});

			assert.ok(style, "Some styles were included");
		});
	});
});
