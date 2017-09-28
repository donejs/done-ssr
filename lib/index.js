var configureLoader = require("./configure_loader");
var makeContext = require("./context");
var ReloadableStartup = require("./reloadable-startup");

//require("can-vdom");
//require("./polyfills/websocket"); // TODO this should be a zone
//require("./polyfills/xhr");
//require("./polyfills/fetch");

var strategies = {
	safe: function(){
		return require("./strategies/safe");
	},
	incremental: function(){
		return require("./strategies/incremental");
	}
};

// TODO move this I think.
var SSRStream = require("./strategies/safe");

global.doneSsr = {};

module.exports = function(config, options){
	var opts = options || {};
	opts.steal = config;

	/*var context = makeContext(config, options);

	// Configure the loader so that the virtual DOM is loaded
	configureLoader(context.steal, context.options);
	context.bundleHelpers = traceBundles(context.steal.loader);

	// Call steal.startup() and save the promise
	var startup = context.startup = new ReloadableStartup(context.steal);

	*/

	// Get the rendering strate
	/*
	var getStrategy = strategies[context.options.strategy || "safe"];
	if(!getStrategy) {
		throw new Error("The rendering strategy " + context.options.strategy +
				" is not supported.");
	}

	var SSRStream = getStrategy();
	*/

	var makeRenderStream = function(requestOrUrl){
		return new SSRStream(requestOrUrl, opts);
		//return new SSRStream(requestOrUrl, startup, context);
	};

	// Expose the loader
	//makeRenderStream.loader = context.steal.loader;

	// Expose the startup promise
	/*
	Object.defineProperty(makeRenderStream, "startupPromise", {
		get: function() { return startup.promise; }
	});
	*/

	return makeRenderStream;
};
