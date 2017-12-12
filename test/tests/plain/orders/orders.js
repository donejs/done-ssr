var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var view = require("./orders.stache");
require("./orders.css");

var ViewModel = DefineMap.extend({
	ordersPromise: {
		get: function(){
			return new Promise(function(resolve){
				resolve([ { a: "a" }, { b: "b" } ]);
			});
		}
	},
	orders: {
		get: function(last, resolve){
			this.ordersPromise.then(resolve);
		}
	}
});

Component.extend({
	tag: "order-history",
	view: view,
	ViewModel: ViewModel
});
