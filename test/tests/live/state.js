var AppMap = require("app-map");

var route = require("can/route/route");
require("can/route/pushstate/pushstate");

module.exports = AppMap.extend({
	env: function(){
		return System.FOO;
	}
});
