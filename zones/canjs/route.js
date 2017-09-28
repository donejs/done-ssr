var canReflect = require("can-reflect");
var noop = Function.prototype;

module.exports = function(data){
	var canRoute, routeData,
		oldRouteData;

	return {
		// If using the steal() Zone, this hook is called after its main is run
		afterStealMain: function(){
			canRoute = data.modules.can.route;
			routeData = canRoute.data;
			routeData.addEventListener("statusCode", noop);
		},
		afterRun: function(){
			try {
				canRoute = require("can-route");
				routeData = canRoute.data;
				routeData.addEventListener("statusCode", noop);
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
				data.statusCode = canReflect.getKeyValue(routeData, "statusCode");
				routeData.removeEventListener("statusCode", noop);
			}
		}
	};
};
