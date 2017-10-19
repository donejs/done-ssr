var once = require("once");

// This is a legacy thing, for steal-css
var doneSsrGlobal = Object.create(null);

module.exports = function(){
	return {
		globals: {
			doneSsr: doneSsrGlobal
		}
	};
};
