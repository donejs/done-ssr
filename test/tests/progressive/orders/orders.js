var can = require("can");
var template = require("./orders.stache!");
require("./orders.css!");
require("can/map/define/");

var ViewModel = can.Map.extend({
	define: {
		orders: {
			Value: can.List,
			get: function(list){
				var id = "foo";
				var dfd = new can.Deferred();

				list.replace(dfd);
				dfd.resolve([ { a: "a", v: 2 }, { b: "b", v: 5 } ]);

				return list;
			}
		},
		totals: {
			get: function(){
				var orders = this.attr("orders");
				var totals = 0;
				orders.each(function(order){
					totals += order.v;
				});
				return totals;
			}
		},
		showTotals: {
			value: false
		}
	}
});

can.Component.extend({
	tag: "order-history",
	template: template,
	viewModel: ViewModel,
	events: {
		inserted: function(){
			this.viewModel.attr("showTotals", true);
		}
	}
});
