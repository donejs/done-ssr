var Steal = require("steal");
var loadExtension = require("./load_extension");
var trigger = require("./trigger");

module.exports = function(cfg){
	var steal = Steal.clone();
	var loader = global.System = steal.System;

	var nodeEnv = process.env.NODE_ENV || "development";
	loader.config({
		env: "server-" + nodeEnv
	});

	steal.config(cfg || {});

	// Ensure the extension is loaded before the main.
	loadExtension(loader);

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
			var doc = new document.constructor();
			var ViewModel = autorender.viewModel;

			if(!ViewModel) {
				throw new Error("can-ssr cannot render your application without a viewModel defined. " +
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

			var render = autorender.render;
			return autorender.renderAsync(render, state, {}, doc)
				.then(function(){
					state.attr("__renderingComplete", true);
				}).then(function() {
					var html = doc.body.innerHTML;

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
