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
	overrides.push(function(){
		return new Override(global, "document", function(){
			console.log( "99999999999" );
			return doc;
		});
	});

	return {
		overrides: overrides
	};
};
