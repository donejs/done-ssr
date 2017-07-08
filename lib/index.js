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

	var SSRStream = function(requestOrUrl){
		Readable.call(this);
		this.requestOrUrl = requestOrUrl;
		this.dests = [];
	};

	util.inherits(SSRStream, Readable);

	SSRStream.prototype._read = function(){
		if(this._renderPromise) { return; }
		this._renderPromise = this.render();
	};

	SSRStream.prototype.render = function(){
		var stream = this;
		var requestOrUrl = this.requestOrUrl;

		return startup.then(function(modules){
			var main = modules.main;
			var can = modules.can;
			var DOCUMENT = modules.DOCUMENT;
			var domMutate = modules.domMutate;

			// Save whether this is a can project or not.
			if(isACanProject === undefined) {
				isACanProject = !!can;
			}

			var request = typeof requestOrUrl === "string" ?
				{ url: requestOrUrl } : requestOrUrl;

			// Create the document
			var doc = new document.constructor();

			addCookies(doc, request);

			var serializeFromBody = !!(main.renderAsync ||
									   main.serializeFromBody);
			if(!serializeFromBody) {
				var head = doc.createElement("head");
				doc.documentElement.insertBefore(head, doc.body);
			}

			// Create a renderer function that when calls will
			// render into a virtual DOM.
			var render = makeRender(main, can);

			var zonePlugins = [
				ssrGlobalsZone(doc, request, loader, steal, modules),
				canRouteDataZone(can),
				assetsZone(doc, bundleHelpers, can),
				responseZone(stream)
			];

			if(typeof XMLHttpRequest !== "undefined") {
				zonePlugins.push(xhrZone(options));
			}

			if(options.html5shiv) {
				zonePlugins.push(html5shivZone(can));
			}

			var timeoutZone = timeout(options.timeout);
			zonePlugins.push(timeoutZone);

			if(options.debug) {
				var debugZone = debug(doc, timeoutZone);
				zonePlugins.push(debugZone);
			}

			var zone = new Zone({
				plugins: zonePlugins
			});

			return zone.run(function(){
				render(request);

				if(isACanProject && can.route) {
					zone.data.viewModel = can.route.data;
				}
			}).then(null, function(err){
				if(!(err instanceof TimeoutError)) {
					throw err;
				}
			}).then(function(data){
				var html;
				if(serializeFromBody) {
					html = doc.body.innerHTML;
				} else {
					html = doc.documentElement.outerHTML;
				}

				var dt = cfg.doctype || doctype;
				html = dt + "\n" + html;

				stream.push(html);
				stream.push(null);
			}, function(error){
				stream.emit("error", error);
			}).then(function(){
				cleanupDocument(doc, DOCUMENT, domMutate);
			});
		}, function(error){
			stream.emit("error", error);
		});
	};

	SSRStream.prototype.pipe = function(dest){
		this.dests.push(dest);
		return Readable.prototype.pipe.apply(this, arguments);
	};


	var makeRenderStream = function(requestOrUrl){
		return new SSRStream(requestOrUrl);
	};

	// Expose the loader
	makeRenderStream.loader = loader;

	// Expose the startup promise
	Object.defineProperty(makeRenderStream, "startupPromise", {
		get: function() { return startup; }
	});

	return makeRenderStream;
};
