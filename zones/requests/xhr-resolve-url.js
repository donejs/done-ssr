var once = require("once");
var resolveUrl = require("../../lib/util/resolve_url");
var XMLHttpRequest2 = require("xmlhttprequest2").XMLHttpRequest;
var zoneRegister = require("can-zone/register");

module.exports = function(request){
	function makeXHR(xhr) {
		var XHR = function() {
			xhr.apply(this, arguments);
			this._hackSend = this.send;
			this.send = XHR.prototype.send;

			this._hackOpen = this.open;
			this.open = XHR.prototype.open;

			// In browsers these default to null
			this.onload = null;
			this.onerror = null;

			// jQuery checks for this property to see if XHR supports CORS
			this.withCredentials = true;
		};

		XHR.prototype.open = function() {
			var args = Array.prototype.slice.call(arguments);
			var relativeUrl = this._relativeUrl = args[1];

			var url = resolveUrl(request, relativeUrl);
			if(url) {
				args[1] = url;
			}

			return this._hackOpen.apply(this, args);
		};


		XHR.prototype.send = function () {
			return this._hackSend.apply(this, arguments);
		};

		return XHR;
	}

	var XMLHttpRequest = makeXHR(XMLHttpRequest2)

	return {
		globals: {
			XMLHttpRequest: XMLHttpRequest
		},
		created: function(){
			registerXHR(XMLHttpRequest);
		}
	};
};

// Calls to can-zone/register so that XHR is wrapped.
// This only needs to happen once, ever.
var registerXHR = once(function(XMLHttpRequest) {
	global.XMLHttpRequest = XMLHttpRequest;
	zoneRegister();
	delete global.XMLHttpRequest;
});
