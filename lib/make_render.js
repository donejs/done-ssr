var url = require("url");
var assign = require("can-util/js/assign/assign");
var isEmptyObject = require("can-util/js/is-empty-object/is-empty-object");
var attr = require("./attr");

module.exports = function(main, can){
	if(main.createState || main.viewModel) {
		var createState = main.createState || makeCreateState(main, can);
		return function(request){
			var state = createState(request);

			if(hasCanRoute(can)) {
				can.route.map(state);
			}

			return main.render(document, state);
		};
	}

	// The new default API
	return main["default"] || main;
};

// This is the legacy createState function for backwards compatibility.
function makeCreateState(main, can){
	return function(request){
		var ViewModel = main.viewModel;

		if(!ViewModel) {
			throw new Error("done-ssr cannot render your application " +
							"without a viewModel defined. " +
							"See the guide for information. " +
							"http://donejs.com/Guide.html#section_Createatemplateandmainfile");
		}

		var pathname = url.parse(request.url).href;
		var params = assign(can.route.deparam(pathname), {
			env: process.env,
			request: request
		});

		var state = new ViewModel(params);

		if(!attr.get(state, "statusCode") &&
				!isEmptyObject(can.route.routes)) {
			if(!params.route) {
				attr.set(state, "statusCode", 404);
				attr.set(state, "statusMessage", "Not found");
			} else {
				attr.set(state, "statusCode", 200);
			}
		}
		return state;

	};
}

function hasCanRoute(can){
	return typeof can !== "undefined" && !!can.route;
}
