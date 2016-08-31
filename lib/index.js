var Readable = require("stream").Readable;
var Steal = require("steal");
var configureLoader = require("./configure_loader");
var trigger = require("./trigger");
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

require("./polyfills/websocket");
require("./polyfills/xhr");

global.doneSsr = {};

var doctype = "<!DOCTYPE html>";

module.exports = function(cfg, options){
	cfg = cfg || {};
	options = defaults(options, {
		timeout: 5000
	});
	var steal = Steal.clone();
	var loader = global.System = steal.System;

	var nodeEnv = process.env.NODE_ENV || "development";
	loader.config({
		env: "server-" + nodeEnv
	});

	steal.config(cfg);

	// Configure the loader so that the virtual DOM is loaded
	configureLoader(loader);
	var bundleHelpers = traceBundles(loader);

	var startup = stealStartup(steal, function(mainPromise){
		startup = mainPromise;
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

		return startup.then(function(main){
			var request = typeof requestOrUrl === "string" ?
				{ url: requestOrUrl } : requestOrUrl;

			// Create the document
			var doc = new document.constructor();

			addCookies(doc, request);

			var serializeFromBody = !!(main.renderAsync ||
									   main.serializeFromBody);
			if(!serializeFromBody) {
				doc.head = doc.createElement("head");
				doc.documentElement.insertBefore(doc.head, doc.body);
			}
			var render = makeRender(main);

			var zonePlugins = [
				ssrGlobalsZone(doc, request, loader),
				canRouteDataZone,
				assetsZone(doc, bundleHelpers),
				responseZone(stream)
			];

			if(typeof XMLHttpRequest !== "undefined") {
				zonePlugins.push(xhrZone(options));
			}

			if(options.html5shiv) {
				zonePlugins.push(html5shivZone);
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
				// Cleanup the dom
				trigger(doc, "removed");
			});
		}, function(error){
			stream.emit("error", error);
		});
	};

	SSRStream.prototype.pipe = function(dest){
		this.dests.push(dest);
		return Readable.prototype.pipe.apply(this, arguments);
	};


	return function(requestOrUrl){
		return new SSRStream(requestOrUrl);
	};
};
