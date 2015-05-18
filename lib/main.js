var loadMain = require("./load_main");
var loadCanVdom = require("./load_canvdom");
var trigger = require("./trigger");

module.exports = function(cfg){
	var startup = loadCanVdom().then(function(){
		return loadMain(cfg);
	});

	return function(url){
		return startup.then(function(renderer){
			var doc = new document.constructor;
			var ViewModel = renderer.viewModel;

			var state = new ViewModel();

			state.attr(can.route.deparam(url));
			state.attr("__renderingAssets", []);

			return can.view.renderAsync(renderer, state, {}, doc)
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
