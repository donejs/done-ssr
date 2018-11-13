var defaults = require("lodash.defaults");
var getPath = require("./util/get_path");
var SSRStream = require("./ssr-stream");
var LRU = require("lru-cache");

// I don't know if we need this...
global.doneSsr = {};

module.exports = function(config, options){
	var opts = defaults(options, {
		timeout: 5000,
		useCacheNormalize: true,
		steal: config,
		strategy: "incremental",
		streamMap: new LRU()
	});

	return function(requestOrUrl){
		var path = getPath(requestOrUrl);
		if(opts.streamMap.has(path)) {
			return opts.streamMap.get(path);
		}

		return new SSRStream(requestOrUrl, opts);
	};
};
