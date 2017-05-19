var Readable = require("stream").Readable;
var cleanupDocument = require("./cleanup");
var configureLoader = require("./configure_loader");
var Zone = require("can-zone");
var makeContext = require("./context");
var makeRender = require("./make_render");
var addCookies = require( "./cookies" );
var traceBundles = require("./bundles/index");
var util = require("util");
var ReloadableStartup = require("./reloadable-startup");

var debug = require("./zones/debug");
var timeout = require("can-zone/timeout");
var TimeoutError = timeout.TimeoutError;
var ssrGlobalsZone = require("./zones/globals");
var canRouteDataZone = require("./zones/route_data");
var xhrZone = require("./zones/xhr");
var assetsZone = require("./zones/assets");
var html5shivZone = require("./zones/html5");
var responseZone = require("./zones/response");

require("can-vdom");
require("./polyfills/websocket");
require("./polyfills/xhr");

var SafeStream = require("./modes/safe");

global.doneSsr = {};

var doctype = "<!DOCTYPE html>";

module.exports = function(config, options){
	var context = makeContext(config, options);

	// Configure the loader so that the virtual DOM is loaded
	configureLoader(context.steal, context.options);
	var bundleHelpers = context.bundleHelpers =
		traceBundles(context.steal.loader);

	// Call steal.startup() and save the promise
	var startup = new ReloadableStartup(context.steal);

	var makeRenderStream = function(requestOrUrl){
		return new SafeStream(requestOrUrl, startup, context);
	};

	// Expose the loader
	makeRenderStream.loader = context.steal.loader;

	// Expose the startup promise
	Object.defineProperty(makeRenderStream, "startupPromise", {
		get: function() { return startup.promise; }
	});

	return makeRenderStream;
};
