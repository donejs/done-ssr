var Map = require("can-map");

require("can-map-define");
require("can-route");

module.exports = Map.extend({
	define: {
		list: {
			get: function(last, set) {
				var xhr = new XMLHttpRequest();

				xhr.addEventListener("load", function() {
					var results = JSON.parse(this.responseText);
					set(results);
				});

				xhr.open("GET", "http://www.example.org/api/list");
				xhr.send();
			}
		}
	}
});
