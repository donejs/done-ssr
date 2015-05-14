var path = require("path");

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
