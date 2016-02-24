var Override = require("can-wait").Override;

module.exports = function ( doc, req ) {
	var overrides = [];

	// If there's a can global
	if(typeof can !== "undefined") {
		overrides.push(function(){
			return new Override(can, "document", function(){
				return doc;
			});
		});
	}
	overrides.push(function(){
		return new Override(global.canSsr, "request", function(){
			return req;
		});
	});
	var globalDoc = global.document;
	overrides.push(function(){
		return new Override(global.canSsr, "globalDocument", function(){
			return globalDoc;
		});
	});
	overrides.push(function(){
		return new Override(global, "document", function(){
			return doc;
		});
	});

	return {
		overrides: overrides
	};
};
