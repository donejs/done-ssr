var DefineMap = require("can-define/map/map");
var route = require("can-route");
require("can-route-pushstate");

module.exports = DefineMap.extend({
	page: "string",

	race: {
		get: function(last, resolve){
			if(!last) {
				var page = this.page;
				var ms = page === "slow" ? 500 : 10;

				setTimeout(function(){
					resolve("passed");
				}, ms);

				return "failed";
			}
		}
	}
});

route("{page}");
