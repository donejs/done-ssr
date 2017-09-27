
module.exports = function(data){
	var canRoute, routeData,
		oldRouteData;

	return {
		// If using the steal() Zone, this hook is called after its main is run
		afterStealMain: function(){
			canRoute = data.modules.can.route;
			routeData = canRoute.data;
		},
		afterRun: function(){
			try {
				canRoute = require("can-route");
				routeData = canRoute.data;
			} catch(e){}
		},

		beforeTask: function() {
			if(canRoute) {
				oldRouteData = canRoute.data;
				canRoute.data = routeData;
			}
		},
		afterTask: function(){
			if(canRoute) {
				canRoute.data = oldRouteData;
			}
		}
	};
};
