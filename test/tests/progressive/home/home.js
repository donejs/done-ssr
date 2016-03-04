require("./home.css!");
var can = require("can");

can.Component.extend({
	tag: 'home-page',
	template: require("./home.stache!"),
	viewModel: {}
});
