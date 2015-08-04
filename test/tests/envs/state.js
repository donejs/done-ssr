var AppMap = require("app_map");

var route = require("can/route/route");
require("can/route/pushstate/pushstate");

module.exports = AppMap.extend({
	env: function(){
		return System.FOO;
	}
});
