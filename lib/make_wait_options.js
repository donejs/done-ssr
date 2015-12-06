var Override = require("can-wait").Override;

module.exports = function(doc){
	// Override document.getElementById, etc. to point to the request's document.

	var overrides = [
		"getElementById",
		"getElementsByTagName"
	].map(function(fn){
		return function(){
			return new Override(document, fn, function(){
				return doc[fn].bind(doc);
			});
		};
	});

	return {
		overrides: overrides
	};
};
