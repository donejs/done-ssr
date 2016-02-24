var AppMap = require("app-map");

require("can/map/define/");
require("can/route/route");

module.exports = AppMap.extend({
	define: {
		xhrResponse: {
			get: function(last, set) {
				var xhr = new XMLHttpRequest();

				xhr.addEventListener("load", function() {
					console.log( "load happened, set will happen" );
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
				console.log( "__id:", document.__id ); // why is this undefined??
				console.log( document.cookie ); // why is this undefined??
				set( document.cookie );
			}
		}
	}
});
