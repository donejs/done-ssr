var url = require("url");

// This is the legacy createState function for backwards compatibility.
module.exports = function(main){
	return function(request){
		var ViewModel = main.viewModel;

		if(!ViewModel) {
			throw new Error("can-ssr cannot render your application " +
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
};
