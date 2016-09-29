var Component = require('can-component');
var Map = require('can-map');
var List = require('can-list');
var template = require("./orders.stache");
require("./orders.css");
require("can-map-define");

var ViewModel = Map.extend({
	define: {
		orders: {
			Value: List,
			get: function(list){
				var id = "foo";

				var promise = new Promise(function(resolve){
					resolve([ { a: "a", v: 2 }, { b: "b", v: 5 } ]);
				});

				list.replace(promise);

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

Component.extend({
	tag: "order-history",
	template: template,
	viewModel: ViewModel,
	events: {
		inserted: function(){
			this.viewModel.attr("showTotals", true);
		}
	}
});
