var path = require("path");
var aliasNpm = require("./alias_npm");

module.exports = function(loader){
	// Configure the loader to set our overrides.
	loader.config({
		map: {
			"can/view/stache/system": "steal-server-side-render/system"
		},
		paths: {
			"steal-server-side-render": path.resolve(__dirname + "/extension.js"),
			"steal-server-side-render/system": path.resolve(__dirname + "/system_stache.js"),
			"steal-server-side-render/system-config": path.resolve(__dirname + "/system_config.js")
		},
		configDependencies: [
			"steal-server-side-render/system-config"
		]
	});

	Object.defineProperty(loader.ext, "stache", {
		get: function() { return "steal-server-side-render/system"; }
	});

	// Alias our module with the default, that way we can require can
	aliasNpm(loader, path.resolve(__dirname+"/.."));

	// Ensure the extension loads before the main.
	var loaderImport = loader.import;
	loader.import = function(name){
		if(name === loader.main) {
			var args = arguments;

			return loader.import("steal-server-side-render").then(function(){
				return loaderImport.apply(loader, args);
			});
		}
		return loaderImport.apply(this, arguments);
	};
};
