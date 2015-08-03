var Steal = require("steal");
var loadExtension = require("./load_extension");
var trigger = require("./trigger");

module.exports = function(cfg){
	var steal = Steal.clone();
	var loader = global.System = steal.System;
	if(process.env.NODE_ENV === "production") {
		loader.env = "production";
	}
	steal.config(cfg || {});

	// Ensure the extension is loaded before the main.
	loadExtension(loader);

	var startup = steal.import(loader.main).then(function(autorender){
		return autorender.importPromise || Promise.resolve(autorender);
	});

	return function(url){
		return startup.then(function(autorender){
			var doc = new document.constructor;
			var ViewModel = autorender.viewModel;

			if(!ViewModel) {
				throw new Error("can-ssr cannot render your application without a viewModel defined. " +
								"See the guide for information. " +
								"http://donejs.com/Guide.html#section_Createatemplateandmainfile");
			}

			var state = new ViewModel();

			state.attr(can.route.deparam(url));
			state.attr("__renderingAssets", []);
			state.attr("@env", process.env);

			var render = autorender.render;
			return autorender.renderAsync(render, state, {}, doc)
				.then(function(){
					state.attr("__renderingComplete", true);
				}).then(function(result){
					var html = doc.body.innerHTML;

					// Cleanup the dom
					trigger(doc, "removed");

					return html;
				});
		});
	};
};
