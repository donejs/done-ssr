var canReflect = require("can-reflect");
var noop = Function.prototype;

module.exports = function(response) {
	return function(data){
		var canRoute, routeData,
			oldRouteData,
			pathname;

		function extractStatusCode() {
			var statusCode = canReflect.getKeyValue(routeData, "statusCode");

			if(!statusCode) {
				var can = data.modules && data.modules.can;
				if(can && can.route) {
					var currentRoute = can.route.rule(pathname);
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
			created: function(){
				pathname = data.window.location.pathname;
			},
			// If using the steal() Zone, this hook is called after its main is run
			afterStealMain: function(){
				if(data.modules.can) {
					canRoute = data.modules.can.route;
					routeData = canRoute.data;
					canReflect.onKeyValue(routeData, "statusCode", noop);
				}
			},
			afterRun: function(){
				try {
					canRoute = require("can-route");
					routeData = canRoute.data;
					canReflect.onKeyValue(routeData, "statusCode", noop);
				} catch(e){}
			},

			beforeTask: function() {
				if(canRoute && routeData) {
					try {
						oldRouteData = canRoute.data;
					} catch(e) {}
					canRoute.data = routeData;
				}
			},
			afterTask: function(){
				if(canRoute && oldRouteData) {
					canRoute.data = oldRouteData;
				}
			},
			ended: function(){
				if(routeData) {
					data.statusCode = extractStatusCode();
					canReflect.offKeyValue(routeData, "statusCode", noop);
					response.statusCode = data.statusCode;
				}
			}
		};
	};
};
