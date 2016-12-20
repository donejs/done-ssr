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
				var promise = new Promise(function(resolve){
					var xhr = new XMLHttpRequest();
					xhr.open("GET", "foo://bar");
					xhr.onload = function(){
						var data = JSON.parse(xhr.responseText);
						resolve(data);
					};
					xhr.send();
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
