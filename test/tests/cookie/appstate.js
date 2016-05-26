var Map = require("can-map");

require("can-map-define");
require("can-route");

module.exports = Map.extend({
	define: {
		xhrResponse: {
			get: function(last, set) {
				var xhr = new XMLHttpRequest();

				xhr.addEventListener("load", function() {
					set( this.responseText );
				});
				xhr.addEventListener("error", function() {
					console.log( "err", this, arguments );
				});

				xhr.open("GET", "http://www.example.org/session");
				xhr.send();
			}
		},
		cookie: {
			get: function ( last, set ) {
				document.cookie = "newCookieKey=newCookieValue";
				set(document.cookie);
			}
		}
	}
});
