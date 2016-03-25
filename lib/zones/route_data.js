var intercept = require("../intercept").once;

// Override can.route.data on every Task execution
module.exports = function(data){

	var oldData, viewModel, noop = function(){};

	function hasCanRoute(){
		return typeof can !== "undefined" && !!can.route;
	}

	return {
		created: function(){
			// We need to know when can.route.data is set the first time so
			// we have the viewModel to continuously set before each task.
			if(hasCanRoute()) {
				oldData = can.route.data;
				intercept(can.route, "data", function(data){
					viewModel = data;
					viewModel.bind("statusCode", noop);
				});
			}
		},
		beforeTask: function(){
			if(hasCanRoute() && !!viewModel) {
				oldData = can.route.data;
				can.route.data = viewModel;
			}
		},
		afterTask: function(){
			if(hasCanRoute() && !!viewModel) {
				can.route.data = oldData;
			}
		},
		ended: function(){
			if(viewModel) {
				data.statusCode = viewModel.attr("statusCode");
				data.state = viewModel;
				viewModel.unbind("statusCode", noop);
			}
		}
	};
};
