var Component = require("can-component");
var Map = require("can-map");
var view = require("./home.stache");

var ViewModel = Map.extend({
});

Component.extend({
	tag: "home-page",
	view: view,
	ViewModel: ViewModel,
	leakScope: true
});
