var DefineMap = require("can-define/map/map");

require("can-route-pushstate");

module.exports = DefineMap.extend({
	envs: function(){
		return System.FOO;
	}
});
