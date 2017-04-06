var ssr = require("../lib/");
var assert = require("assert");
var path = require("path");
var through = require("through2");

describe("live-reload", function(){
	this.timeout(10000);

	before(function(){
		this.render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "lr/index.stache!done-autorender",
			liveReloadHost: "localhost",
			configDependencies: [
				"live-reload"
			]
		});
	});

	it("Initially works", function(done){
		var renderStream = this.render("/");
		renderStream.pipe(through(function(){
			assert.ok(true, "Rendered");
			done();
		}));
	});

	it("A failure in live-reload doesn't prevent it from still working", function(done){
		var render = this.render;
		render.startupPromise
		.then(function(){
			var loader = render.loader;
			var liveReload = loader.get("live-reload").default;

			// Remove a module that is needed for ssr to run.
			return loader.normalize("can-util/namespace", "@ssr")
			.then(function(name){
				loader["delete"](name);
			})
			.then(function(){
				return liveReload(loader.main);
			});
		})
		.then(function(){
			// Now render a page.
			var renderStream = render("/");
			renderStream.pipe(through(function(){
				assert.ok(true, "Rendering worked!");
				done();
			}));
		});
	});
});
