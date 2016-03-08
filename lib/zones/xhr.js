var Zone = require("can-zone");
var xhrZone = require("can-zone/xhr");

module.exports = function(data){

	var oldSend;

	var send = function(){
		var req = global.doneSsr.request;
		var cookie = req.headers && req.headers.cookie || "";

		var self = this;
		this.addEventListener("load", Zone.waitFor(function () {
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

		// TODO:
		// don't attach the cookies if the xhr url isn't the
		// same domain as the express req domain unless CORS

		if (cookie.length) {
			this.setDisableHeaderCheck( true );
			this.setRequestHeader( "cookie", cookie );
		}

		return oldSend.apply(this, arguments);
	};

	return {
		plugins: [xhrZone],

		beforeTask: function(){
			oldSend = XMLHttpRequest.prototype.send;
			XMLHttpRequest.prototype.send = send;
		},

		afterTask: function(){
			XMLHttpRequest.prototype.send = oldSend;
		},

		// Attach the xhr content to the end of the body
		ended: function(){
			var doc = data.document;

			var body = doc.body.getElementsByTagName("body")[0] || doc.body;
			if(data.xhr) {
				var xhrScript = doc.createElement("script");
				var xhrTN = doc.createTextNode(data.xhr.toString());
				xhrScript.appendChild(xhrTN);
				body.insertBefore(xhrScript, body.lastChild);
			}
		}
	};
};
