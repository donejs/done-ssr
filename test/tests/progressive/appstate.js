var AppMap = require("app-map");

module.exports = AppMap.extend({
	throwError: function() {
		throw Error('Something went wrong');
	}
});
