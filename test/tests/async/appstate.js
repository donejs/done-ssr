var Map = require("can-map");
require("can-map-define");

module.exports = Map.extend({
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
		},
		statusCode: {
			get: function(val, setVal){
				if(!setVal) return 200;
				var page = this.attr("page");
				setTimeout(function(){
					var status = page === "fake" ? 404 : 200;
					setVal(status);
				}, 50);
			}
		}
	}
});
