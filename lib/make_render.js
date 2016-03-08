var url = require("url");

module.exports = function(main){
	if(main.createState || main.viewModel) {
		var createState = main.createState || makeCreateState(main);
		return function(request){
			var state = createState(request);

			if(hasCanRoute()) {
				can.route.data = state;
			}

			return main.render(document, state);
		};
	}

	// The new default API
	return main["default"] || main;
};

// This is the legacy createState function for backwards compatibility.
function makeCreateState(main){
	return function(request){
		var ViewModel = main.viewModel;

		if(!ViewModel) {
			throw new Error("done-ssr cannot render your application " +
							"without a viewModel defined. " +
							"See the guide for information. " +
							"http://donejs.com/Guide.html#section_Createatemplateandmainfile");
		}

		var pathname = url.parse(request.url).href;
		var params = can.extend(can.route.deparam(pathname), {
			__renderingAssets: [],
			env: process.env,
			request: request
		});

		var state = new ViewModel(params);

		if(!state.attr('statusCode') &&
				!can.isEmptyObject(can.route.routes)) {
			if(!params.route) {
				state.attr({
					statusCode: 404,
					statusMessage: "Not found"
				});
			} else {
				state.attr({ statusCode: 200 });
			}
		}
		return state;

	};
}

function hasCanRoute(){
	return typeof can !== "undefined" && !!can.route;
}
