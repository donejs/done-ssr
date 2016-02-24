var url = require("url");
var xhr = require('xmlhttprequest').XMLHttpRequest;
var fullUrl = /^https?:\/\//i;

module.exports = function( global, doc,  req ) {
	var baseUri = req.url || "";
	if ( req.protocol && req.get ) {
		baseUri = req.protocol + '://' + req.get( "host" ) + baseUri;
	}

	var XHR = global.XMLHttpRequest = function() {
		xhr.apply(this, arguments);
		this._hackSend = this.send;
		this.send = XHR.prototype.send;

		var oldOpen = this.open;
		this.open = function() {
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
		var cookie = req.headers && req.headers.cookie || "";

		// TODO:
		// don't attach the cookies if the xhr url isn't the
		// same domain as the express req domain unless CORS

		if ( cookie.length ) {
			this.setDisableHeaderCheck( true );
			this.setRequestHeader( "cookie", cookie );
		}
		
		return this._hackSend.apply(this, arguments);
	};

	//TODO... when an ajax req is made durin SSR to same domain,
	//		if 'Set-Cookie' is on the ajax req's response header, the current 'doc' needs to get those cookies
	//		which would, in turn, because of the setter, add 'Set-Cookie' headers for those cookies
	//		to the initial SSR request's own response.
};
