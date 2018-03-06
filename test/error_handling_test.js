var ssr = require("../lib/");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("Handling errors during app lifecycle", function(){
	this.timeout(10000);

	var reloader;
	var sources = {
		"async/helpers": "module.exports = {};"
	};

	function reloadableFile(data) {
		function fetchOverride(fetch) {
			return function(load){
				if(sources[load.name]) {
					return Promise.resolve(sources[load.name]);
				}
				return fetch.apply(this, arguments);
			};
		}

		return {
			beforeStealStartup: function(){
				var loader = data.steal.loader;
				loader.fetch = fetchOverride(loader.fetch);

				// Load live-reload so we can use it
				this.waitFor(loader.import("live-reload").then(function(mod){
					reloader = mod;
				}));
			}
		};
	}

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "async/index.stache!done-autorender",
			configDependencies: ["live-reload"]
		}, {
			zones: [reloadableFile]
		});
	});

	afterEach(function(){
		sources["async/helpers"] = "module.exports = {};";
	});

	it("An error that occurs on live-reload is forwarded as an error", function(done){
		var render = this.render;
		render("/home").pipe(through(function(){

			// App has loaded successfully, now cause an error
			sources["async/helpers"] = "module.exports = {}; \n something 'syntax'";
			reloader("async/helpers").then(function(){
				var renderStream = render("/home");
				renderStream.pipe(through(Function.prototype));
				renderStream.on("error", function(err){
					try {
						assert.ok(err instanceof SyntaxError);
					} catch(e) {
						assert.ok(false, e);
					} finally {
						done();
					}
				});
			});
		}));
	});

	it.only("After an error occurs, fixing the error restores rendering", function(done){
		var render = this.render;
		render("/home").pipe(through(function(){
			// App has loaded successfully, now cause an error
			sources["async/helpers"] = "module.exports = {}; \n something 'syntax'";
			reloader("async/helpers").then(function(){
				var renderStream = render("/home");
				renderStream.pipe(through(Function.prototype));
				renderStream.on("error", function(err){
					sources["async/helpers"] = "module.exports = {};";
					reloader("async/helpers").then(function(){
						var renderStream = render("/home");
						renderStream.pipe(through(function(buffer){
							var html = buffer.toString();
							assert.ok(/hello async/.test(html), "returned the right html");
							done();
						}));
						renderStream.on("error", function(){
							assert.ok(false, "Got an error after fixing it");
							done();
						});
					});
				});
			});
		}));
	});
});
