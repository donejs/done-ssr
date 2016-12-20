var attr = require("../attr");

// Override can.route.data on every Task execution
module.exports = function(can){
	return function(data){
		var oldData, viewModel, noop = function(){};

		function routeData(value) {
			var isSetter = !!arguments.length;
			// Setter
			if(isSetter && value) {
				can.route.data = value;
			} else if(!isSetter) {
				try {
					return can.route.data;
				} catch(e){}
			}
		}

		function hasCanRoute(){
			return typeof can !== "undefined" && !!can.route;
		}

		return {
			created: function(){
				// We need to know when can.route.data is set the first time so
				// we have the viewModel to continuously set before each task.
				if(hasCanRoute()) {
					var oldMap = can.route.map;
					can.route.map = function(data){
						viewModel = data;
						viewModel.bind("statusCode", noop);
						can.route.map = oldMap;
					};
				}
			},
			beforeTask: function(){
				if(hasCanRoute() && !!viewModel) {
					oldData = routeData();
					routeData(viewModel);
				}
			},
			afterTask: function(){
				if(hasCanRoute() && !!viewModel) {
					routeData(oldData);
				}
			},
			ended: function(){
				if(viewModel) {
					data.statusCode = attr.get(viewModel, "statusCode");
					data.state = viewModel;
					viewModel.unbind("statusCode", noop);
				}
			}
		};
	};
};
