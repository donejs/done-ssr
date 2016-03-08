var can = require("can");
var template = require("./home.stache!");

var ViewModel = can.Map.extend({
});

can.Component.extend({
	tag: "home-page",
	template: template,
	viewModel: ViewModel
});
