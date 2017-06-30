var resolveUrl = require("../util/resolve_url");
var xhr = require("xmlhttprequest2").XMLHttpRequest;


var XHR = global.XMLHttpRequest = function() {
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
	var url = resolveUrl(global.doneSsr.request, args[1]);
	if(url) {
		args[1] = url;
	}

	return this._hackOpen.apply(this, args);
};


XHR.prototype.send = function () {
	return this._hackSend.apply(this, arguments);
};
