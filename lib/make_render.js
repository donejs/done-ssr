var assign = require("can-util/js/assign/assign");
var canReflect = require("can-reflect");
var isEmptyObject = require("can-util/js/is-empty-object/is-empty-object");
var url = require("url");


module.exports = function(main, can){
	if(main.createState || main.viewModel) {
		var createState = main.createState || makeCreateState(main, can);
		var render = main.renderIntoDocument || main.render;
		return function(request){
			var state = createState(request);

			if(hasCanRoute(can)) {
				can.route.data = state;
				can.route.ready();
			}

			return render.call(main, document, state);
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
			env: Object.assign({}, process.env),
			request: request
		});

		var state = new ViewModel(params);

		if(!Object.isSealed(state) &&
			!canReflect.getKeyValue(state, "statusCode") &&
			!isEmptyObject(can.route.routes)) {
			// fix: support root-url (i.e '/') in production-mode
			if(typeof params.route === "string") {
				canReflect.setKeyValue(state, "statusCode", 200);
			} else {
				canReflect.setKeyValue(state, "statusCode", 404);
				canReflect.setKeyValue(state, "statusMessage", "Not found");
			}
		}
		return state;

	};
}

function hasCanRoute(can){
	return typeof can !== "undefined" && !!can.route;
}
