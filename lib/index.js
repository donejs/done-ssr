/*global canWait:false */
var Steal = require("steal");
var loadExtension = require("./load_extension");
var trigger = require("./trigger");
var makeMap = require("./make_map");
var mergeResponseData = require("./merge_response_data");
var wait = require("can-wait");
var makeCreateState = require("./create_state");
var makeWaitOptions = require("./make_wait_options");
var addCookies = require( "./cookies" );

global.canSsr = {};

module.exports = function(cfg, options){
	options = getOptions(options);
	var steal = Steal.clone();
	var loader = global.System = steal.System;

	var nodeEnv = process.env.NODE_ENV || "development";
	loader.config({
		env: "server-" + nodeEnv
	});

	steal.config(cfg || {});

	// Ensure the extension is loaded before the main.
	loadExtension(loader, options);

	function getMainModule(main){
		// startup returns an Array in dev
		main = Array.isArray(main) ? main[0] : main;
		return main.importPromise || Promise.resolve(main);
	}

	var startup = steal.startup().then(function(main){
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

			addCookies( doc, request );

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

			// Support both the legacy autorender API and the new API
			// specified by https://github.com/canjs/can-ssr/issues/80
			var useLegacyAPI = main.legacy !== false &&
				main.renderAsync;
			var render = !useLegacyAPI ? main.render.bind(main) :
				function(){
				var render = main.render;
				return main.renderAsync(render, state, {}, doc)
					.then(function(result){
						(result.canWaitData || []).forEach(function(data){
							canWait.data(data);
						});
					}, function(err){
						throw err;
					});
			};

			var state, stateMap;
			var addRouteOverride = function ( stateMap ) {
				return new wait.Override(
					can.route, "data",
					function () {
						return stateMap;
					}
				);
			};
			var run = function(){
				state = createState(request);
				stateMap = makeMap(state);

				var zone = canWait.currentRequest;
				if ( can.route ) {
					zone.overrides.push( addRouteOverride( stateMap ) );
				}

				var task = new zone.constructor.Task(zone, function(){
					render(doc, state);
				});

				Promise.resolve(task.run()).then(null, function(errors){
					(errors || []).forEach(function(error){
						canWait.error(error);
					});
				});
			};
			var waitOpts = makeWaitOptions(doc, request);
			return wait(run, waitOpts)
				.then(function(resp){
					if ( can.route ) {
						waitOpts.overrides.push( function () { return addRouteOverride( stateMap ); } );
					}
					return wait(function() {
						mergeResponseData(stateMap, resp);
					}, waitOpts);
				})
				.then(function(){
					return wait(function() {
						stateMap.attr( "__renderingComplete", true );
					}, waitOpts);
				})
				.then(function() {
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

function getOptions(opts){
	opts = opts || {};

	if(opts.plugins !== false && !opts.plugins) {
		opts.plugins = [
			"canjs"
		];
	}
	if(!opts.plugins) {
		opts.plugins = [];
	}

	return opts;
}
