var Override = require("../lib/override");
var safePush = require("../lib/util/safe_push");

module.exports = function(response){
	var responses = Array.isArray(response) ? response : [response];
	var override;

	function fetch(relativeUrl){
		var oldFetch = override.oldValue;
		return oldFetch.apply(this, arguments).then(function(resp){
			// _readableBody is set by zones/requests/fetch
			var body = resp._readableBody;
			var push = safePush.bind(null, relativeUrl, null, body);
			responses.forEach(push);
			return resp;
		});
	}

	return {
		created: function(){
			override = Override.global("fetch", fetch);
		},
		beforeTask: function(){
			override.on();
		},
		afterTask: function(){
			override.off();
		}
	};
};
