var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var view = require("./home.stache");

var ViewModel = DefineMap.extend({});

Component.extend({
	tag: "home-page",
	view: view,
	ViewModel: ViewModel,
	leakScope: true
});
