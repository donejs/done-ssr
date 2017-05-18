var attr = require("../attr");
var isEmptyObject = require("can-util/js/is-empty-object/is-empty-object");

// Override can.route.data on every Task execution
module.exports = function(can){
	return function(data){
		var oldData, viewModel, noop = function(){}, hasBound = false;

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

		function hasRoutes() {
			return hasCanRoute() && !isEmptyObject(can.route.routes);
		}

		function extractStatusCode(viewModel) {
			var statusCode = attr.get(viewModel, "statusCode");

			if(!statusCode) {
				if(hasRoutes()) {
					var currentRoute = can.route.matched();
					// fix: support root-url (i.e '/') in develop-mode
					if(currentRoute || (currentRoute === "")) {
						statusCode = 200;
					} else {
						// If there is no current route it is likely a 404
						statusCode = 404;
					}
				} else {
					statusCode = 200;
				}
			}

			return statusCode;
		}

		return {
			beforeTask: function(){
				if(hasCanRoute() && !!data.viewModel) {
					oldData = routeData();
					routeData(viewModel);
				}
				if(data.viewModel && !hasBound) {
					hasBound = true;
					data.viewModel.addEventListener('statusCode', noop);
				}
			},
			afterTask: function(){
				if(hasCanRoute() && !!data.viewModel) {
					routeData(oldData);
				}
			},
			ended: function(){
				var viewModel = data.viewModel;
				if(viewModel) {
					data.statusCode = extractStatusCode(viewModel);
					data.state = viewModel;
					viewModel.removeEventListener('statusCode', noop);
				}
			}
		};
	};
};
