var path = require("path");
var aliasNpm = require("./alias_npm");

module.exports = function(loader){
	// Configure the loader to set our overrides.
	loader.config({
		map: {
			"can/view/stache/system": "can-ssr/system",
			"live-reload": "@empty"
		},
		paths: {
			"can-ssr": path.resolve(__dirname + "/extension.js"),
			"can-ssr/system": path.resolve(__dirname + "/system_stache.js"),
			"can-ssr/system-config": path.resolve(__dirname + "/system_config.js")
		},
		configDependencies: [
			"can-ssr/system-config"
		]
	});

	if(loader.env !== "production") {
		loader.map["can-ssr"] = "can-ssr/system";

		Object.defineProperty(loader.ext, "stache", {
			get: function() { return "can-ssr/system"; }
		});
	}

	// Alias our module with the default, that way we can require can
	aliasNpm(loader, path.resolve(__dirname+"/.."));

	// Ensure the extension loads before the main.
	var loaderImport = loader.import;
	loader.import = function(name){
		if(name === loader.main) {
			var args = arguments;

			return loader.import("can-ssr").then(function(){
				return loaderImport.apply(loader, args);
			});
		}
		return loaderImport.apply(this, arguments);
	};
};
