var Override = require("can-wait").Override;

module.exports = function(doc){
	var overrides = [];

	// If there's a can global
	if(typeof can !== "undefined") {
		overrides.push(function(){
			return new Override(can, "document", function(){
				return doc;
			});
		});
	}

	return {
		overrides: overrides
	};
};
