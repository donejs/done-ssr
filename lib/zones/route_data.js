var intercept = require("../intercept").once;

// Override can.route.data on every Task execution
module.exports = function(data){

	var oldData, viewModel;

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
			data.state = viewModel;
		}
	};
};
