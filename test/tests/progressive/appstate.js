var Map = require("can/map/");

module.exports = Map.extend({
	throwError: function() {
		throw Error('Something went wrong');
	}
});
