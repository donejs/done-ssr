var define = require("can-define");
var route = require("can-route");
require("can-route-pushstate");

route(":page");

function ViewModel() {

}

define(ViewModel.prototype, {
	page: "string"
});

module.exports = ViewModel;
