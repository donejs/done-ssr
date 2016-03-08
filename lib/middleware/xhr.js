var url = require("url");
var xhr = require('xmlhttprequest').XMLHttpRequest;
var fullUrl = /^https?:\/\//i;

module.exports = function( global ) {

	var XHR = global.XMLHttpRequest = function() {
		xhr.apply(this, arguments);
		this._hackSend = this.send;
		this.send = XHR.prototype.send;

		var oldOpen = this.open;
		this.open = function() {
			var req = global.doneSsr.request;
			var baseUri = req.url || "";
			if ( req.protocol && req.get ) {
				baseUri = req.protocol + '://' + req.get( "host" ) + baseUri;
			}
			var args = Array.prototype.slice.call(arguments);
			var reqURL = args[1];

			if ( reqURL && !fullUrl.test( reqURL ) ) {
				args[1] = url.resolve( baseUri, reqURL );
			}

			return oldOpen.apply(this, args);
		};

		// jQuery checks for this property to see if XHR supports CORS
		this.withCredentials = true;
	};

	XHR.prototype.send = function () {
		return this._hackSend.apply(this, arguments);
	};
};
