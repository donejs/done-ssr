var AppMap = require("app-map");

require("can/map/define/");
require("can/route/route");

module.exports = AppMap.extend({
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
