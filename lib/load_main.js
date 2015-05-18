var Steal = require("steal");
var loadExtension = require("./load_extension");

module.exports = function(cfg){
	// Remove window temporary to prevent browser detection.
	var win = global.window;
	var doc = global.document;
	global.window = undefined;
	global.document = undefined;

	var steal = Steal.clone();

	var loader = global.System = steal.System;
	if(process.env.NODE_ENV === "production") {
		loader.env = "production";
	}
	steal.config(cfg || {});

	// Ensure the extension is loaded before the main.
	loadExtension(loader);

	var startup = steal.import(loader.main);

	// Add back window and document so they can be used.
	global.window = win;
	global.document = doc;

	return startup;
};
