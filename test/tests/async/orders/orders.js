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

				var xhr = new XMLHttpRequest();
				xhr.open("GET", "foo://bar");
				xhr.onload = function(){
					var data = JSON.parse(xhr.responseText);
					dfd.resolve(data);
				};
				xhr.send();

				list.replace(dfd);

				return list;
			}
		}
	}
});

can.Component.extend({
	tag: "order-history",
	template: template,
	viewModel: ViewModel
});
