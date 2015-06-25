var xhr = require('xmlhttprequest').XMLHttpRequest;
var relative = /^https?:\/\//i;
var XMLHttpRequest = global.XMLHttpRequest = function() {
	xhr.apply(this, arguments);

	var oldOpen = this.open;
	this.open = function() {
		var args = Array.prototype.slice.call(arguments);
		var url = args[1];

		if(url && !relative.test(url)) {
			args[1] = XMLHttpRequest.base + url;
		}
		return oldOpen.apply(this, args);
	};
};

module.exports = function() {
	return function(req, res, next) {
		XMLHttpRequest.base = req.protocol + "://" + req.get('host');
		next();
	};
};
