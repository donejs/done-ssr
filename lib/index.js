var Readable = require("stream").Readable;
var Steal = require("steal");
var cleanupDocument = require("./cleanup");
var configureLoader = require("./configure_loader");
var Zone = require("can-zone");
var makeRender = require("./make_render");
var addCookies = require( "./cookies" );
var traceBundles = require("./bundles/index");
var util = require("util");
var defaults = require("lodash.defaults");
var stealStartup = require("./startup");

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

module.exports = function(cfg, options){
	cfg = cfg || {};
	options = defaults(options, {
		timeout: 5000,
		useCacheNormalize: true
	});
	var steal = Steal.clone();
	var loader = global.System = steal.System;
	var isACanProject;

	var nodeEnv = process.env.NODE_ENV || "development";
	loader.config({
		env: "server-" + nodeEnv
	});

	steal.config(cfg);

	// Configure the loader so that the virtual DOM is loaded
	configureLoader(steal, options);
	var bundleHelpers = traceBundles(loader);

	var startup = stealStartup(steal, function(mainPromise){
		var oldStartup = startup;
		startup = mainPromise.then(function(modules){
			// We were unable to reload the can modules which means
			// there is some bug. But we can continue to render anyways.
			if(isACanProject && !modules.can) {
				return oldStartup;
			}

			return modules;
		});
	});

	var makeRenderStream = function(requestOrUrl){
		var stream = new SafeStream(requestOrUrl);
		Object.defineProperty(stream, "startup", {
			get: function() { return startup; }
		});
		return stream;
	};

	// Expose the loader
	makeRenderStream.loader = loader;

	// Expose the startup promise
	Object.defineProperty(makeRenderStream, "startupPromise", {
		get: function() { return startup; }
	});

	return makeRenderStream;
};
