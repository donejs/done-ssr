var Map = require("can-define/map/map");
var route = require("can-route");
require("can-route-pushstate");

route(":page");

module.exports = Map.extend({
	page: "string"
});
