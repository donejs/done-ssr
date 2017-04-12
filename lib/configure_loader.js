var Deferred = require("./deferred");
var pkg = require("../package.json");

global.navigator = global.navigator || {
	userAgent: "Mozilla/5.0 " + "done-ssr/" + pkg.version
};

module.exports = function(steal, options){
	var loader = steal.loader;
	var stealDone = new Deferred();

	// Ensure the extension loads before the main.
	var loaderImport = loader.import;
	loader.import = function(name){
		if(name === loader.main) {
			var args = arguments;

			steal.done().then(stealDone.resolve);

			// Set up the default renderingBaseURL which plugins use to
			// create addresses for assets when baseURL is pointing to
			// a file:// when running in SSR on the server.
			if(!loader.renderingBaseURL) {
				var baseURL = loader.renderingBaseURL || loader.baseURL;
				if(baseURL.indexOf("file:") === 0) {
					baseURL = "/";
				}
				loader.renderingBaseURL = baseURL;
			}

			return loaderImport.apply(loader, args);
		}
		return loaderImport.apply(this, arguments);
	};

	if(options.useCacheNormalize) {
		stealDone.promise.then(addCacheNormalize.bind(null, loader));
	}
};

function addCacheNormalize(loader) {
	var getCacheName = function(identifier, parentName){
		var parentModuleName = parentName || "@none";
		var cacheName = identifier + "+" + parentModuleName;
		return cacheName;
	};

	loader._normalizeCache = Object.create(null);

	var normalize = loader.normalize;
	loader.normalize = function(name, parentName){
		var cacheName = getCacheName(name, parentName);
		var cache = this._normalizeCache;

		if(cacheName in cache) {
			var moduleName = cache[cacheName];
			if(moduleName in this._loader.modules) {
				return Promise.resolve(moduleName);
			}
		}

		return Promise.resolve(normalize.apply(this, arguments))
		.then(function(normalizedName) {
			cache[cacheName] = normalizedName;
			return normalizedName;
		});
	};
}
