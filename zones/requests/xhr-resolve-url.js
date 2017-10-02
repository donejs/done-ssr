var once = require("once");
var resolveUrl = require("../../lib/util/resolve_url");
var XMLHttpRequest2 = require("xmlhttprequest2").XMLHttpRequest;
var zoneRegister = require("can-zone/register");

var XHR_WAITING = Symbol("xhr-resolve.waiting");

module.exports = function(request){
	function makeXHR(xhr) {
		var XHR = function() {
			xhr.apply(this, arguments);
			this._hackSend = this.send;
			this.send = XHR.prototype.send;

			this._hackOpen = this.open;
			this.open = XHR.prototype.open;

			this._hackAEL = this.addEventListener;
			this.addEventListener = XHR.prototype.addEventListener;

			this._hackREL = this.removeEventListener;
			this.removeEventListener = XHR.prototype.removeEventListener;

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

		XHR.prototype.addEventListener = function(name, cb){
			if(name === "load") {
				var orig = cb;
				orig[XHR_WAITING] = true;
				cb = CanZone.waitFor(function(){
					orig[XHR_WAITING] = false;
					return orig.apply(this, arguments);
				});
			}

			return this._hackAEL.call(this, name, cb);
		};

		XHR.prototype.removeEventListener = function(name, cb){
			if(name === "load" && cb[XHR_WAITING]) {
				CanZone.current.removeWait();
			}
			return this._hackREL.call(this, name, cb);
		};

		return XHR;
	}

	return {
		created: function(){
			registerXHR(makeXHR(XMLHttpRequest2));
		}
	};
};

var registerXHR = once(function(XMLHttpRequest) {
	global.XMLHttpRequest = XMLHttpRequest;
	require("can-zone/register")();
});
