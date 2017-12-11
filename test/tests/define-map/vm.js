var DefineMap = require("can-define/map/map");
var route = require("can-route");
require("can-route-pushstate");

route("{page}");

module.exports = DefineMap.extend({
	page: "string"
});
