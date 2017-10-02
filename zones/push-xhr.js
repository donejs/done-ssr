var safePush = require("../lib/util/safe_push");
var Zone = require("can-zone");

module.exports = function(response){
	var xhrSend;

	function send() {
		var xhr = this;
		var onload = this.onload;
		this.onload = Zone.current.wrap(function(){
			var text = xhr.responseText || "";
			safePush(xhr._relativeUrl, null, text, response);
			return onload.apply(this, arguments);
		});
		return xhrSend.apply(this, arguments);
	}

	return {
		beforeTask: function(){
			xhrSend = XMLHttpRequest.prototype.send;
			XMLHttpRequest.prototype.send = send;
		},
		afterTask: function(){
			XMLHttpRequest.prototype.send = xhrSend;
		}
	};
};
