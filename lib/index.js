var defaults = require("lodash.defaults");
var getPath = require("./util/get_path");
var SSRStream = require("./ssr-stream");
var LRU = require("lru-cache");
var simpleDOM = require("../zones/can-simple-dom");

// I don't know if we need this...
global.doneSsr = {};

module.exports = function(config, options){
	var runFn = typeof config === "function" && config;

	var opts = defaults(options, {
		timeout: 5000,
		exitOnTimeout: false,
		useCacheNormalize: true,
		steal: runFn ? false: config,
		strategy: "incremental",
		streamMap: new LRU(),
		domZone: simpleDOM,
		fn: runFn,
		xhrCache: true
	});

	return function(requestOrUrl){
		var path = getPath(requestOrUrl);
		if(opts.streamMap.has(path)) {
			return opts.streamMap.get(path);
		}

		return new SSRStream(requestOrUrl, opts);
	};
};
