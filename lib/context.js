var defaults = require("lodash.defaults");
var Steal = require("steal");

module.exports = function(config, options){
	var cfg = config || {};
	var opts = defaults(options, {
		timeout: 5000,
		useCacheNormalize: true
	});
	var steal = Steal.clone();
	var loader = global.System = steal.System;

	var nodeEnv = process.env.NODE_ENV || "development";
	loader.config({
		env: "server-" + nodeEnv
	});

	steal.config(cfg);

    return {
        steal: steal,
        config: cfg,
        options: opts
    };
};