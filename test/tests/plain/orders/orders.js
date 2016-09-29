var Component = require("can-component");
var Map = require("can-map");
var List = require("can-list");
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
					resolve([ { a: "a" }, { b: "b" } ]);
				});
				list.replace(promise);

				return list;
			}
		}
	}
});

Component.extend({
	tag: "order-history",
	template: template,
	viewModel: ViewModel
});
