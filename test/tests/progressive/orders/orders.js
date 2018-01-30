var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var view = require("./orders.stache");
require("./orders.css");

var ViewModel = DefineMap.extend({
	ordersPromise: {
		get: function(){
			return new Promise(function(resolve){
				resolve([ { a: "a", v: 2 }, { b: "b", v: 5 } ]);
			});
		}
	},
	orders: {
		get: function(last, resolve){
			this.ordersPromise.then(resolve);
		}
	},
	totals: {
		get: function(){
			var orders = this.orders || [];
			var totals = 0;
			orders.forEach(function(order){
				totals += order.v;
			});
			return totals;
		}
	},
	showTotals: {
		default: false
	},
	connectedCallback: function(){
		this.showTotals = true;
	}
});

Component.extend({
	tag: "order-history",
	view: view,
	ViewModel: ViewModel
});
