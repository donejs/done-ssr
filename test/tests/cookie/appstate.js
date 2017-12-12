var DefineMap = require("can-define/map/map");
require("can-route");

module.exports = DefineMap.extend({
	xhrResponse: {
		get: function(last, set) {
			var xhr = new XMLHttpRequest();

			xhr.addEventListener("load", function() {
				set( this.responseText );
			});
			xhr.addEventListener("error", function() {
				console.log( "err", this, arguments );
			});

			xhr.open("GET", "http://localhost:8070/session");
			xhr.send();
		}
	},
	cookie: {
		get: function ( last, set ) {
			document.cookie = "newCookieKey=newCookieValue";
			set(document.cookie);
		}
	}
});
