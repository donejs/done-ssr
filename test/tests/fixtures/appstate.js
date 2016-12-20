var List = require("can-list");
var Map = require("can-map");
require("can-map-define");

module.exports = Map.extend({
	define: {
		things: {
			Value: List,
			get: function(list){
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "http://www.example.org/stuff");
				xhr.addEventListener("load", function(){
					var json = xhr.responseText;
					var data = JSON.parse(json);
					list.replace(data);
				});
				xhr.send();

				return list;
			}
		}
	}
});
