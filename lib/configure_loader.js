var path = require("path");
var pkg = require("../package.json");

global.navigator = global.navigator || {
	userAgent: "Mozilla/5.0 " + "done-ssr/" + pkg.version
};

module.exports = function(loader){
	// Configure the loader to set our overrides.
	loader.config({
		paths: {
			"@ssr/system-config": "file:" + path.resolve(
				path.join(__dirname,"system_config.js"))
		},
		configDependencies: [
			"@ssr/system-config"
		]
	});

	// Ensure the extension loads before the main.
	var loaderImport = loader.import;
	loader.import = function(name){
		if(name === loader.main) {
			var args = arguments;

			// Set up the renderingLoader to be used by plugins to know what root
			// to attach urls to.
			if(!loader.renderingLoader) {
				loader.renderingLoader = loader.clone();
				var baseURL = loader.renderingBaseURL || loader.baseURL;
				if(baseURL.indexOf("file:") === 0) {
					baseURL = "/";
				}
				loader.renderingLoader.baseURL = baseURL;
			}

			return loaderImport.apply(loader, args);
		}
		return loaderImport.apply(this, arguments);
	};
};
