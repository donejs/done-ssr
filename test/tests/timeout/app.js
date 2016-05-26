var Map = require("can-map");
require("can-map-define");
var route = require("can-route");
require("can-route-pushstate");

module.exports = Map.extend({
	define: {
		page: {
			type: "string"
		},

		race: {
			get: function(last, set){
				if(!last) {
					var page = this.attr("page");
					var ms = page === "slow" ? 500 : 10;

					setTimeout(function(){
						set("passed");
					}, ms);

					return "failed";
				}
			}
		}
	}
});

route(":page");
