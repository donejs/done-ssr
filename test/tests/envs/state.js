var Map = require("can-map");

require("can-route-pushstate");

module.exports = Map.extend({
	envs: function(){
		return System.FOO;
	}
});
