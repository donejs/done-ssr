/*global canWait:false */
var Steal = require("steal");
var loadExtension = require("./load_extension");
var trigger = require("./trigger");
var makeMap = require("./make_map");
var mergeResponseData = require("./merge_response_data");
var wait = require("can-wait");

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

	function getAutorender(autorender){
		// startup returns an Array in dev
		autorender = Array.isArray(autorender) ? autorender[0] : autorender;
		return autorender.importPromise || Promise.resolve(autorender);
	}

	var startup = steal.startup().then(function(autorender){
		// If live-reload is enabled we need to get a new autorender each
		// time a reload cycle is complete.
		if(loader.has("live-reload")) {
			var importOpts = {name: "@ssr"};
			loader.import("live-reload", importOpts).then(function(reload){
				reload(function(){
					startup = loader.import(loader.main).then(getAutorender);
				});
			});
		}
		return getAutorender(autorender);
	});

	return function(url){
		return startup.then(function(autorender){
			var serializeFromBody = !!(autorender.renderAsync ||
									   autorender.serializeFromBody);
			var doc = new document.constructor();
			if(!serializeFromBody) {
				doc.head = doc.createElement("head");
				doc.documentElement.insertBefore(doc.head, doc.body);
			}

			// New API is createState, if not fall back to the old API
			var createState = autorender.createState || function(request){
				var ViewModel = autorender.viewModel;

				if(!ViewModel) {
					throw new Error("can-ssr cannot render your application " +
									"without a viewModel defined. " +
									"See the guide for information. " +
									"http://donejs.com/Guide.html#section_Createatemplateandmainfile");
				}

				var state = new ViewModel();
				var params = can.route.deparam(url);

				state.attr(params);
				state.attr("__renderingAssets", []);
				state.attr("env", process.env);

				if(typeof state.pageStatus === 'function' &&
						!state.attr('statusCode') &&
						!can.isEmptyObject(can.route.routes)) {
					if(!params.route) {
						state.pageStatus(404, 'Not found');
					} else {
						state.pageStatus(200);
					}
				}
				return state;

			};

			// Support both the legacy autorender API and the new API
			// specified by https://github.com/canjs/can-ssr/issues/80
			var useLegacyAPI = autorender.legacy !== false &&
				autorender.renderAsync;
			var render = !useLegacyAPI ? autorender.render.bind(autorender) :
				function(){
				var render = autorender.render;
				return autorender.renderAsync(render, state, {}, doc)
					.then(function(result){
						(result.canWaitData || []).forEach(function(data){
							canWait.data(data);
						});
					}, function(err){
						throw err;
					});
			};

			var state, stateMap;
			var run = function(){
				state = createState({ url: url });
				stateMap = makeMap(state);

				Promise.resolve(render(doc, state)).then(null, function(errors){
					(errors || []).forEach(function(error){
						canWait.error(error);
					});
				});
			};

			return wait(run)
			//return Promise.resolve(render(doc, state))
				.then(function(resp){
					mergeResponseData(stateMap, resp);
				})
				.then(function(){
					stateMap.attr("__renderingComplete", true);
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
