var Steal = require("steal");
var loadExtension = require("./load_extension");
var trigger = require("./trigger");

module.exports = function(cfg){
	var steal = Steal.clone();
	steal.config(cfg || {});
	var loader = global.System = steal.System;

	// Ensure the extension is loaded before the main.
	loadExtension(loader);

	var startup = steal.import(loader.main);

	return function(url){
		return startup.then(function(renderer){
			var doc = new document.constructor;
			var ViewModel = renderer.viewModel;

			var state = new ViewModel();

			state.attr(can.route.deparam(url));
			state.attr("@assets", []);

			return can.view.renderAsync(renderer, state, {}, doc).then(function(result){
				var html = doc.body.innerHTML;

				// Cleanup the dom
				trigger(doc, "removed");

				return html;
			});
		});
	};
};
