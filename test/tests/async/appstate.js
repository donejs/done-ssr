var AppMap = require("app-map");
require("can/map/define/");

module.exports = AppMap.extend({
	define: {
		page: {
			set: function(val){
				if(val === "home") {
					var state = this;
					setTimeout(function(){
						state.attr("message", "hello async!");
					}, 300);
				}

				return val;
			}
		},
		message: {
			type: "string"
		}
	}
});
