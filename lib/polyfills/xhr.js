var resolveUrl = require("../util/resolve_url");
var safePush = require("../util/safe_push");
var XMLHttpRequest2 = require("xmlhttprequest2").XMLHttpRequest;
var Zone = require("can-zone");

function createXHR(xhr) {
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

		var url = resolveUrl(global.doneSsr.request, relativeUrl);
		if(url) {
			args[1] = url;
		}

		return this._hackOpen.apply(this, args);
	};


	XHR.prototype.send = function () {
		if(global.doneSsr.pushResources) {
			var xhr = this;
			var onload = this.onload;
			this.onload = Zone.current.wrap(function(){
				var responses = global.doneSsr.responses || [];
				var push = safePush.bind(null, xhr._relativeUrl, null,
					xhr.responseText || "");
				responses.forEach(push);

				return onload.apply(this, arguments);
			});
		}

		return this._hackSend.apply(this, arguments);
	};

	return XHR;
}

global.XMLHttpRequest = createXHR(XMLHttpRequest2);

module.exports = createXHR;
