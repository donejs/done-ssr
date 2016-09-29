var xhrZone = require("can-zone/xhr");
var url = require('url');

module.exports = function(options){
	if (options.auth) {
		if (!options.auth.cookie || !options.auth.domains) {
			throw new Error('The auth.cookie and auth.domains must both be provided.');
		}
		var cookieReg = RegExp(options.auth.cookie + "=(.+?);");
	}

	return function(data){
		var oldSend, oldOpen;

		// Override open to attach auth header if the domain is approved.
		var open = function(httpMethod, xhrURL){
			var req = global.doneSsr.request;
			var cookie = req.headers && req.headers.cookie || "";

			// Monkey patch URL onto xhr for cookie origin checking in the send method.
			var reqURL = url.parse(xhrURL);
			this.__url = reqURL;

			if (options.auth && cookie) {
				var domainIsApproved = options.auth.domains.reduce(function(prev, domain){
					return prev || reqURL.host.indexOf(domain) >= 0;
				}, false);

				// If on an approved domain copy the jwt from a cookie to the request headers.
				if (domainIsApproved) {
					var jwtCookie = cookieReg.exec(cookie);
					if(jwtCookie && !this.getRequestHeader('authorization')){
						this.setRequestHeader('authorization', 'Bearer ' + jwtCookie[1]);
					}
				}
			}
			return oldOpen.apply(this, arguments);
		};

		var send = function(){
			var req = global.doneSsr.request;
			var cookie = req.headers && req.headers.cookie || "";
			var self = this;
			var onload = this.onload;

			this.onload = function(){
				var setcookies = self.getResponseHeader( "Set-Cookie" );
				if ( !setcookies ) {
					if(onload) {
						return onload.apply(this, arguments);
					}
					return;
				}
				if ( !Array.isArray( setcookies ) ) {
					setcookies = [ setcookies ];
				}
				for ( var i = 0; i < setcookies.length; i++ ) {
					document.cookie = setcookies[ i ];
				}
				if(onload) {
					return onload.apply(this, arguments);
				}
			};

			// TODO:
			// don't attach the cookies if the xhr url isn't the
			// same domain as the express req domain unless CORS
			// check host in this.__url

			if (cookie.length) {
				this.setDisableHeaderCheck( true );
				this.setRequestHeader( "cookie", cookie );
			}

			return oldSend.apply(this, arguments);
		};

		return {
			plugins: [xhrZone],

			beforeTask: function(){
				oldOpen = XMLHttpRequest.prototype.open;
				XMLHttpRequest.prototype.open = open;

				oldSend = XMLHttpRequest.prototype.send;
				XMLHttpRequest.prototype.send = send;
			},

			afterTask: function(){
				XMLHttpRequest.prototype.open = oldOpen;
				XMLHttpRequest.prototype.send = oldSend;
			},

			// Attach the xhr content to the end of the body
			ended: function(){
				var doc = data.document;

				if(doc) {
					var body = doc.body.getElementsByTagName("body")[0] || doc.body;
					if(data.xhr) {
						var xhrScript = doc.createElement("script");
						var xhrTN = doc.createTextNode(data.xhr.toString());
						xhrScript.appendChild(xhrTN);
						body.insertBefore(xhrScript, body.lastChild);
					}
				}
			}
		};
	};
};
