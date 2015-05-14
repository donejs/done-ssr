var can = require("can");
var template = require("./orders.stache!");
require("./orders.css!");

can.Component.extend({
	tag: "order-history",
	template: template
});
