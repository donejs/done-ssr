var Steal = require("steal");
var configureLoader = require("./configure_loader");
var trigger = require("./trigger");
var makeMap = require("./make_map");
var Zone = require("can-zone");
var makeCreateState = require("./create_state");
var addCookies = require( "./cookies" );
var traceBundles = require("./bundles/index");

var ssrGlobalsZone = require("./zones/globals");
var canRouteDataZone = require("./zones/route_data");
var xhrZone = require("./zones/xhr");
var assetsZone = require("./zones/assets");
var html5shivZone = require("./zones/html5");

global.canSsr = {};

module.exports = function(cfg, options){
	options = options || {};
	var steal = Steal.clone();
	var loader = global.System = steal.System;

	var nodeEnv = process.env.NODE_ENV || "development";
	loader.config({
		env: "server-" + nodeEnv
	});

	steal.config(cfg || {});

	// Configure the loader so that the virtual DOM is loaded
	configureLoader(loader, options);
	var bundleHelpers = traceBundles(loader);

	function getMainModule(main){
		// startup returns an Array in dev
		main = Array.isArray(main) ? main[0] : main;
		return main.importPromise || Promise.resolve(main);
	}

	var startup = steal.startup().then(function(main){
		if(!canSsr.globalDocument && typeof document !== "undefined") {
			canSsr.globalDocument = document;
		}

		// If live-reload is enabled we need to get a new main each
		// time a reload cycle is complete.
		if(loader.has("live-reload")) {
			var importOpts = {name: "@ssr"};
			loader.import("live-reload", importOpts).then(function(reload){
				reload(function(){
					startup = loader.import(loader.main).then(getMainModule);
				});
			});
		}
		return getMainModule(main);
	});

	return function(requestOrUrl){
		return startup.then(function(main){
			// Setup options
			var serializeFromBody = !!(main.renderAsync ||
									   main.serializeFromBody);
			var request = typeof requestOrUrl === "string" ? { url: requestOrUrl } : requestOrUrl;

			// Create the document
			var doc = new document.constructor();

			addCookies(doc, request);

			// doc.__addSerializerAndParser is not available in CanJS older than 2.3.11
			if (typeof doc.__addSerializerAndParser === "function") {
				doc.__addSerializerAndParser(document.__serializer,
											document.__parser);
			}

			if(!serializeFromBody) {
				doc.head = doc.createElement("head");
				doc.documentElement.insertBefore(doc.head, doc.body);
			}

			// New API is createState, if not fall back to the old API
			var createState = main.createState || makeCreateState(main);

			var render = main.render.bind(main);

			var state, stateMap;

			var execute = function(){
				state = createState(request);
				stateMap = makeMap(state);

				if(hasCanRoute()) {
					can.route.data = stateMap;
				}

				return render(doc, state);
			};

			var zonePlugins = [
				ssrGlobalsZone(doc, request, loader),
				canRouteDataZone,
				assetsZone(doc, bundleHelpers)
			];

			if(typeof XMLHttpRequest !== "undefined") {
				zonePlugins.push(xhrZone);
			}

			if(options.html5shiv) {
				zonePlugins.push(html5shivZone);
			}

			var zone = new Zone({
				plugins: zonePlugins
			});

			return zone.run(execute).then(function(){
				var html;
				if(serializeFromBody) {
					html = doc.body.innerHTML;
				} else {
					html = doc.documentElement.outerHTML;
				}

				// Cleanup the dom
				trigger(doc, "removed");

				return {
					state: state,
					html: html
				};
			});
		});
	};
};

function hasCanRoute(){
	return typeof can !== "undefined" && !!can.route;
}
