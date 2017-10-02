var defaults = require("lodash.defaults");
var SSRStream = require("./ssr-stream");

// I don't know if we need this...
global.doneSsr = {};

module.exports = function(config, options){
	var opts = defaults(options, {
		timeout: 5000,
		useCacheNormalize: true,
		steal: config
	});

	return function(requestOrUrl){
		return new SSRStream(requestOrUrl, opts);
	};
};
