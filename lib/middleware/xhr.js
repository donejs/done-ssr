var url = require("url");
var xhr = require('xmlhttprequest').XMLHttpRequest;
var waitFor = require("can-wait/waitfor").waitFor;
var fullUrl = /^https?:\/\//i;

module.exports = function( global ) {

	var XHR = global.XMLHttpRequest = function() {
		xhr.apply(this, arguments);
		this._hackSend = this.send;
		this.send = XHR.prototype.send;

		var oldOpen = this.open;
		this.open = function() {
			var req = global.canSsr.request;
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

		var self = this;
		this.addEventListener( "load", waitFor(function () {
			var setcookies = self.getResponseHeader( "Set-Cookie" );
			if ( !setcookies ) {
				return;
			}
			if ( !Array.isArray( setcookies ) ) {
				setcookies = [ setcookies ];
			}
			for ( var i = 0; i < setcookies.length; i++ ) {
				document.cookie = setcookies[ i ];
			}
		}));

		// jQuery checks for this property to see if XHR supports CORS
		this.withCredentials = true;
	};

	XHR.prototype.send = function () {
		var req = global.canSsr.request;
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
};
