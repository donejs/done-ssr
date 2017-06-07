var configureLoader = require("./configure_loader");
var makeContext = require("./context");
var traceBundles = require("./bundles/index");
var ReloadableStartup = require("./reloadable-startup");

require("can-vdom");
require("./polyfills/websocket");
require("./polyfills/xhr");

var strategies = {
	safe: function(){
		return require("./strategies/safe");
	},
	incremental: function(){
		return require("./strategies/incremental");
	}
};

global.doneSsr = {};

module.exports = function(config, options){
	var context = makeContext(config, options);

	// Configure the loader so that the virtual DOM is loaded
	configureLoader(context.steal, context.options);
	context.bundleHelpers = traceBundles(context.steal.loader);

	// Call steal.startup() and save the promise
	var startup = context.startup = new ReloadableStartup(context.steal);

	// Get the rendering strate
	var getStrategy = strategies[context.options.strategy || "safe"];
	if(!getStrategy) {
		throw new Error("The rendering strategy " + context.options.strategy +
				" is not supported.");
	}
	var SSRStream = getStrategy();

	var makeRenderStream = function(requestOrUrl){
		return new SSRStream(requestOrUrl, startup, context);
	};

	// Expose the loader
	makeRenderStream.loader = context.steal.loader;

	// Expose the startup promise
	Object.defineProperty(makeRenderStream, "startupPromise", {
		get: function() { return startup.promise; }
	});

	return makeRenderStream;
};
