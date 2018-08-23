var ssr = require("../lib/");
var helpers = require("./helpers");
var incHelpers = require("./inc_helpers");
var assert = require("assert");
var path = require("path");

describe("Incremental rendering", function(){
	this.timeout(10000);

	before(function(done){
		helpers.createServer(8070, function(req, res){
			var data;
			switch(req.url) {
				case "/bar":
					data = [ { "a": "a" }, { "b": "b" } ];
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(data));
					break;
				default:
					throw new Error("No route for " + req.url);
			}
		})
		.then(server => {
			this.server = server;
			done();
		});

		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender"
		}, {
			strategy: "incremental"
		});
	});

	after(function(){
		this.server.close();
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
