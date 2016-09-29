var Component = require("can-component");
var Map = require("can-map");
var template = require("./home.stache");

var ViewModel = Map.extend({
});

Component.extend({
	tag: "home-page",
	template: template,
	viewModel: ViewModel
});
