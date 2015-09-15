var xhr = require('xmlhttprequest').XMLHttpRequest;
var relative = /^https?:\/\//i;
var MyXMLHttpRequest = global.XMLHttpRequest = function() {
	xhr.apply(this, arguments);

	var oldOpen = this.open;
	this.open = function() {
		var args = Array.prototype.slice.call(arguments);
		var url = args[1];

		if(url && !relative.test(url)) {
			args[1] = MyXMLHttpRequest.base + url;
		}
		return oldOpen.apply(this, args);
	};
};

module.exports = function() {
	return function(req, res, next) {
		MyXMLHttpRequest.base = req.protocol + "://" + req.get('host');
		next();
	};
};
