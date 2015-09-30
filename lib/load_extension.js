var path = require("path");
var aliasNpm = require("./alias_npm");

// Override config to prevent the baseURL from being set to something that
// can't be used to render.
function overrideConfig(loader){
	var config = loader.config;
	loader.config = function(){
		var res = config.apply(this, arguments);

		var envs = this.envs;
		if(envs) {
			Object.keys(envs).forEach(function(key){
				var config = envs[key];
				if(config.baseURL) {
					loader.renderingBaseURL = config.baseURL;
					delete config.baseURL;
				}
			});
		}

		return res;
	};
}

module.exports = function(loader){
	// Configure the loader to set our overrides.
	loader.config({
		paths: {
			"@ssr": "file:" + path.resolve(path.join(__dirname, "extension.js")),
			"@ssr/*": "file:" + path.resolve(path.join(__dirname, "/*.js")),
			"@ssr/system-config": "file:" + path.resolve(path.join(__dirname, "system_config.js"))
		},
		configDependencies: [
			"@ssr/system-config"
		]
	});

	// Alias our module with the default, that way we can require can
	aliasNpm(loader, path.resolve(path.join(__dirname, "..")));

	overrideConfig(loader);

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


			return loader.import("@ssr").then(function(){
				return loaderImport.apply(loader, args);
			});
		}
		return loaderImport.apply(this, arguments);
	};
};
