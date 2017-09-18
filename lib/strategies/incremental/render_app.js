var addCookies = require("../../cookies");
var makeRender = require("../../make_render");
var Zone = require("can-zone");

var debug = require("../../zones/debug");
var timeout = require("can-zone/timeout");
var ssrGlobalsZone = require("../../zones/globals");
var canRouteDataZone = require("../../zones/route_data");
var xhrZone = require("../../zones/xhr");
var incStylesZone = require("./styles_zone");
var html5shivZone = require("../../zones/html5");
var responseZone = require("../../zones/response");

module.exports = function(stream, request, modules, context, plugins){
	var startup = context.startup;
	var steal = context.steal;
	var bundleHelpers = context.bundleHelpers;
	var options = context.options;

	var main = modules.main;
	var can = modules.can;

	// Save whether this is a can project or not.
	if(startup.isACanProject === null) {
		startup.isACanProject = !!can;
	}

	// Create the document
	var doc = new document.constructor();

	addCookies(doc, request);

	// Create a renderer function that when calls will
	// render into a virtual DOM.
	var render = makeRender(main, can);

	var zonePlugins = [
		ssrGlobalsZone(doc, stream, steal, modules),
		canRouteDataZone(can),
		incStylesZone(doc, bundleHelpers, can),
		responseZone(stream)
	].concat(plugins);

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

	var promise = zone.run(function(){
		render(request);

		if(startup.isACanProject && can.route) {
			zone.data.viewModel = can.route.data;
		}
	});

	zone.data.runCalled = true;

	return {
		zone: zone,
		promise: promise,
		document: doc,
		initialStylesLoaded: function(){
			return zone.data.initialStylesLoaded;
		}
	};
};
