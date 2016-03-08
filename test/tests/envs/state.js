var AppMap = require("can/map/");

var route = require("can/route/route");
require("can/route/pushstate/pushstate");

module.exports = AppMap.extend({
	envs: function(){
		return System.FOO;
	}
});
