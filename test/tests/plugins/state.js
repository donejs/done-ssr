var AppMap = require("app-map");

var loader = require("@loader");
var route = require("can/route/route");
require("can/route/pushstate/pushstate");

module.exports = AppMap.extend({

	foo: function(){
		return !!loader.fooPluginInstalled;
	}

});
