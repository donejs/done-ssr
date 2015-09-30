var xhr = require('xmlhttprequest').XMLHttpRequest;
var relative = /^https?:\/\//i;

var XHR = module.exports = global.XMLHttpRequest = function() {
	xhr.apply(this, arguments);

	var oldOpen = this.open;
	this.open = function() {
		var args = Array.prototype.slice.call(arguments);
		var url = args[1];

		if(url && !relative.test(url)) {
			args[1] = XHR.base + url;
		}
		return oldOpen.apply(this, args);
	};
	// jQuery checks for this property to see if XHR supports CORS
	this.withCredentials = true;
};
