var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var view = require("./orders.stache");
require("./orders.css");

var ViewModel = DefineMap.extend({
	ordersPromise: {
		get: function(){
			return new Promise(function(resolve){
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "http://localhost:8070/bar");
				xhr.onload = function(){
					var data = JSON.parse(xhr.responseText);
					resolve(data);
				};
				xhr.onerror = function(err){
					console.error(err);
				};
				xhr.send();
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
