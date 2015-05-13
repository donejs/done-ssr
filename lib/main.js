var Steal = require("steal");
var loadExtension = require("./load_extension");

module.exports = function(cfg){
	var steal = Steal.clone();
	steal.config(cfg || {});
	var loader = global.System = steal.System;

	// Ensure the extension is loaded before the main.
	loadExtension(loader);

	return function(url){
		// TODO do the things we need.
	};
};
